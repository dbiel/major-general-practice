import type { AudioEngine, ScheduledEvent } from "./engine";
import type { Step } from "../controller/session";
import type { SongData } from "../data/schema";
import { scheduleStep, stepDurationSec } from "./schedule";
import { secondsPerBeat } from "../lib/bpm";

export class MockAudioEngine implements AudioEngine {
  events: ScheduledEvent[] = [];
  private song?: SongData;
  private beatCb?: (downbeat: boolean) => void;
  private clock = 0;

  async initialize(song: SongData) {
    this.song = song;
    this.events = [];
    this.clock = 0;
  }

  async playCountIn(bpm: number) {
    const spb = secondsPerBeat(bpm);
    for (let b = 0; b < 4; b++) {
      this.events.push({ kind: "click", time: this.clock + b * spb, downbeat: b === 0 });
      this.beatCb?.(b === 0);
    }
    this.clock += 4 * spb;
  }

  async executeStep(step: Step, bpm: number) {
    if (!this.song) throw new Error("not initialized");
    const events = scheduleStep(step, bpm, this.song, this.clock);
    this.events.push(...events);
    for (const e of events) {
      if (e.kind === "click") this.beatCb?.(e.downbeat);
    }
    this.clock += stepDurationSec(step, bpm, this.song);
  }

  stop() {
    // no-op for mock
  }

  onBeat(cb: (downbeat: boolean) => void) {
    this.beatCb = cb;
  }
}
