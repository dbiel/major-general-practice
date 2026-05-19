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

  async initialize(song: SongData) {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // iOS Safari: must be resumed inside a user gesture.
    if (this.ctx.state === "suspended") await this.ctx.resume();

    this.song = song;
    this.downClick = makeClickBuffer(this.ctx, true);
    this.upClick = makeClickBuffer(this.ctx, false);

    const response = await fetch(song.sourceAudio);
    const arrayBuf = await response.arrayBuffer();
    this.vocalBuffer = await this.ctx.decodeAudioData(arrayBuf);
    this.stretcher = new VocalStretcher(this.ctx, this.vocalBuffer);
  }

  async playCountIn(bpm: number): Promise<void> {
    const spb = secondsPerBeat(bpm);
    const start = this.ctx.currentTime + 0.05;
    for (let b = 0; b < 4; b++) {
      this.scheduleClick(start + b * spb, b === 0);
    }
    await this.waitUntil(start + 4 * spb);
  }

  async executeStep(step: Step, bpm: number): Promise<void> {
    if (!this.song || !this.stretcher) throw new Error("not initialized");
    this.stretcher.setStretchRatio(stretchRatio(bpm, this.song.originalBpm));

    const start = this.ctx.currentTime + 0.05;
    const events = scheduleStep(step, bpm, this.song, start);

    for (const e of events) {
      if (e.kind === "click") {
        this.scheduleClick(e.time, e.downbeat);
      } else if (step.phase === "listen") {
        this.stretcher.scheduleSegment(e.time, e.chunkStartSec, e.chunkEndSec);
      }
    }

    const duration = stepDurationSec(step, bpm, this.song);
    await this.waitUntil(start + duration + 0.3);
  }

  stop() {
    for (const src of this.activeSources) {
      try { src.stop(); } catch { /* ignore */ }
    }
    this.activeSources = [];
    this.stretcher?.stop();
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
