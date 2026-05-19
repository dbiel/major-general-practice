import type { Step } from "../controller/session";
import type { SongData, Chunk } from "../data/schema";
import type { ScheduledEvent } from "./engine";
import { secondsPerBeat } from "../lib/bpm";

export function scheduleStep(
  step: Step,
  bpm: number,
  song: SongData,
  startAt: number
): ScheduledEvent[] {
  const chunks = step.chunkIds.map(id => findChunk(song, id));
  const events: ScheduledEvent[] = [];
  const spb = secondsPerBeat(bpm);
  let offset = 0;

  for (const chunk of chunks) {
    // Schedule one click per beat in this chunk.
    for (let b = 0; b < chunk.beats; b++) {
      events.push({
        kind: "click",
        time: startAt + offset + b * spb,
        downbeat: b === 0,
      });
    }
    // Schedule vocal segment only during listen.
    if (step.phase === "listen") {
      events.push({
        kind: "vocalSegment",
        time: startAt + offset,
        chunkStartSec: chunk.startSec,
        chunkEndSec: chunk.endSec,
      });
    }
    offset += chunk.beats * spb;
  }
  return events;
}

export function stepDurationSec(step: Step, bpm: number, song: SongData): number {
  const beats = step.chunkIds
    .map(id => findChunk(song, id).beats)
    .reduce((a, b) => a + b, 0);
  return beats * secondsPerBeat(bpm);
}

function findChunk(song: SongData, id: string): Chunk {
  for (const verse of song.verses) {
    const c = verse.chunks.find(x => x.id === id);
    if (c) return c;
  }
  throw new Error(`chunk not found: ${id}`);
}
