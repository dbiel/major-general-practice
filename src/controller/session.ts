export type Phase = "listen" | "repeat";

export type Step = {
  chunkIds: string[];
  phase: Phase;
  setIndex: number;
  totalSets: number;
  repIndex: number;
  totalReps: number;
};

export function buildQueue(selectedChunks: string[], repsPerSet: number): Step[] {
  if (selectedChunks.length === 0) {
    throw new Error("buildQueue requires at least one selected chunk");
  }
  if (repsPerSet < 1) {
    throw new Error("repsPerSet must be >= 1");
  }

  const sets: string[][] = [];
  for (let i = 0; i < selectedChunks.length; i++) {
    sets.push([selectedChunks[i]]);
    if (i > 0) {
      sets.push(selectedChunks.slice(0, i + 1));
    }
  }

  const totalSets = sets.length;
  const queue: Step[] = [];
  for (let s = 0; s < sets.length; s++) {
    const chunkIds = sets[s];
    for (let r = 0; r < repsPerSet; r++) {
      queue.push({ chunkIds, phase: "listen", setIndex: s, totalSets, repIndex: r, totalReps: repsPerSet });
      queue.push({ chunkIds, phase: "repeat", setIndex: s, totalSets, repIndex: r, totalReps: repsPerSet });
    }
  }
  return queue;
}
