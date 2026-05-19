import type { Step } from "../controller/session";
import type { SongData } from "../data/schema";

export type ScheduledEvent =
  | { kind: "click"; time: number; downbeat: boolean }
  | { kind: "vocalSegment"; time: number; chunkStartSec: number; chunkEndSec: number };

export interface AudioEngine {
  /** Must be called inside a user-gesture handler (iOS requires this). */
  initialize(song: SongData): Promise<void>;

  /** Plays a 4-beat count-in at the given BPM. Resolves when the last click ends. */
  playCountIn(bpm: number): Promise<void>;

  /** Executes one step. Resolves when the step (including 0.3s tail) finishes. */
  executeStep(step: Step, bpm: number): Promise<void>;

  /** Pauses any in-flight audio and resets scheduling. Safe to call mid-step. */
  stop(): void;

  /** Sets a callback that fires on each click for the visual metronome. */
  onBeat(cb: (downbeat: boolean) => void): void;
}
