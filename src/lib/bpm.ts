export const secondsPerBeat = (bpm: number) => 60 / bpm;

export const chunkDurationSec = (beats: number, bpm: number) => beats * secondsPerBeat(bpm);

export const clampBpm = (bpm: number, min: number, max: number) =>
  Math.min(Math.max(bpm, min), max);

export const stretchRatio = (targetBpm: number, originalBpm: number) => targetBpm / originalBpm;
