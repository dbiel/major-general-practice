import type { AudioEngine } from "./engine";
import type { Step } from "../controller/session";
import type { SongData } from "../data/schema";
import { scheduleStep, stepDurationSec } from "./schedule";
import { makeClickBuffer } from "./click-buffer";
import { VocalStretcher } from "./stretcher";
import { secondsPerBeat, stretchRatio } from "../lib/bpm";

export class WebAudioEngine implements AudioEngine {
  private ctx!: AudioContext;
  private song?: SongData;
  private vocalBuffer?: AudioBuffer;
  private stretcher?: VocalStretcher;
  private downClick?: AudioBuffer;
  private upClick?: AudioBuffer;
  private beatCb?: (downbeat: boolean) => void;
  private activeSources: AudioBufferSourceNode[] = [];
  // Audio-clock cursor for the next event. When > currentTime, we extend rather
  // than restart, which makes count-in → first step and step → step seamless.
  private nextScheduledTime = 0;

  // Lookahead before scheduling any new audio against the audio clock.
  private static readonly LOOKAHEAD_SEC = 0.05;
  // How early to resolve a scheduling promise before the audio actually finishes,
  // so the next scheduling call can land without a gap.
  private static readonly EARLY_RESOLVE_SEC = 0.1;

  async initialize(song: SongData) {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // iOS Safari: must be resumed inside a user gesture.
    if (this.ctx.state === "suspended") await this.ctx.resume();

    this.song = song;
    this.downClick = makeClickBuffer(this.ctx, true);
    this.upClick = makeClickBuffer(this.ctx, false);
    this.nextScheduledTime = 0;

    const response = await fetch(song.sourceAudio);
    const arrayBuf = await response.arrayBuffer();
    this.vocalBuffer = await this.ctx.decodeAudioData(arrayBuf);
    this.stretcher = new VocalStretcher(this.ctx, this.vocalBuffer);
  }

  async playCountIn(bpm: number): Promise<void> {
    const spb = secondsPerBeat(bpm);
    const start = this.nextStart();
    for (let b = 0; b < 4; b++) {
      this.scheduleClick(start + b * spb, b === 0);
    }
    this.nextScheduledTime = start + 4 * spb;
    // Resolve early so the caller can schedule the first step before the
    // count-in's last click decays — the next step's first beat then lands
    // exactly where beat 5 of the count-in would have.
    await this.waitUntil(this.nextScheduledTime - WebAudioEngine.EARLY_RESOLVE_SEC);
  }

  async executeStep(step: Step, bpm: number): Promise<void> {
    if (!this.song || !this.stretcher) throw new Error("not initialized");
    this.stretcher.setStretchRatio(stretchRatio(bpm, this.song.originalBpm));

    const start = this.nextStart();
    const events = scheduleStep(step, bpm, this.song, start);

    for (const e of events) {
      if (e.kind === "click") {
        this.scheduleClick(e.time, e.downbeat);
      } else if (step.phase === "listen") {
        this.stretcher.scheduleSegment(e.time, e.chunkStartSec, e.chunkEndSec);
      }
    }

    const duration = stepDurationSec(step, bpm, this.song);
    this.nextScheduledTime = start + duration;
    await this.waitUntil(this.nextScheduledTime - WebAudioEngine.EARLY_RESOLVE_SEC);
  }

  stop() {
    for (const src of this.activeSources) {
      try { src.stop(); } catch { /* ignore */ }
    }
    this.activeSources = [];
    this.stretcher?.stop();
    // Reset the cursor — resume / next start should pick up against the live
    // clock, not against scheduling that was cancelled.
    this.nextScheduledTime = 0;
  }

  /** Next safe start time: at least LOOKAHEAD ahead of the live clock, and
   *  never earlier than the end of audio we've already scheduled. */
  private nextStart(): number {
    return Math.max(this.ctx.currentTime + WebAudioEngine.LOOKAHEAD_SEC, this.nextScheduledTime);
  }

  onBeat(cb: (downbeat: boolean) => void) {
    this.beatCb = cb;
  }

  private scheduleClick(time: number, downbeat: boolean) {
    const src = this.ctx.createBufferSource();
    src.buffer = downbeat ? this.downClick! : this.upClick!;
    src.connect(this.ctx.destination);
    src.start(time);
    this.activeSources.push(src);
    // Fire onBeat at the click time using audio-clock-derived setTimeout.
    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    setTimeout(() => this.beatCb?.(downbeat), delayMs);
  }

  private waitUntil(audioTime: number): Promise<void> {
    const ms = Math.max(0, (audioTime - this.ctx.currentTime) * 1000);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
