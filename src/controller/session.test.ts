import { describe, it, expect } from "vitest";
import { buildQueue, type Step } from "./session";

describe("buildQueue", () => {
  it("throws when no chunks selected", () => {
    expect(() => buildQueue([], 5)).toThrow();
  });

  it("N=1 emits one set of `reps` × 2 phases", () => {
    const q = buildQueue(["A"], 3);
    expect(q).toHaveLength(3 * 2);
    expect(q[0]).toMatchObject({ chunkIds: ["A"], phase: "listen", setIndex: 0, totalSets: 1, repIndex: 0, totalReps: 3 });
    expect(q[1]).toMatchObject({ chunkIds: ["A"], phase: "repeat", repIndex: 0 });
    expect(q[2]).toMatchObject({ chunkIds: ["A"], phase: "listen", repIndex: 1 });
  });

  it("N=2 emits 3 sets: [A], [B], [A,B]", () => {
    const q = buildQueue(["A", "B"], 5);
    expect(q).toHaveLength(3 * 5 * 2);
    const sets = collectSets(q);
    expect(sets).toEqual([["A"], ["B"], ["A", "B"]]);
  });

  it("N=4 cumulative snowball: A, B, AB, C, ABC, D, ABCD", () => {
    const q = buildQueue(["A", "B", "C", "D"], 5);
    expect(q).toHaveLength(7 * 5 * 2);
    const sets = collectSets(q);
    expect(sets).toEqual([
      ["A"],
      ["B"],
      ["A", "B"],
      ["C"],
      ["A", "B", "C"],
      ["D"],
      ["A", "B", "C", "D"],
    ]);
  });

  it("preserves selection order for non-contiguous picks (A,C)", () => {
    const q = buildQueue(["A", "C"], 2);
    expect(collectSets(q)).toEqual([["A"], ["C"], ["A", "C"]]);
  });

  it("each rep has listen immediately followed by repeat", () => {
    const q = buildQueue(["A", "B"], 2);
    for (let i = 0; i < q.length; i += 2) {
      expect(q[i].phase).toBe("listen");
      expect(q[i + 1].phase).toBe("repeat");
      expect(q[i].chunkIds).toEqual(q[i + 1].chunkIds);
      expect(q[i].repIndex).toBe(q[i + 1].repIndex);
    }
  });

  it("setIndex/totalSets propagate correctly", () => {
    const q = buildQueue(["A", "B", "C"], 5);
    // expected totalSets for N=3: 2N-1 = 5
    expect(q[0].totalSets).toBe(5);
    expect(q.at(-1)?.setIndex).toBe(4);
  });
});

function collectSets(q: Step[]): string[][] {
  const seen: string[][] = [];
  let lastSetIndex = -1;
  for (const step of q) {
    if (step.setIndex !== lastSetIndex) {
      seen.push(step.chunkIds);
      lastSetIndex = step.setIndex;
    }
  }
  return seen;
}
