import { describe, it, expect } from "vitest";
import { scheduleStep, stepDurationSec } from "./schedule";
import type { Step } from "../controller/session";
import type { SongData } from "../data/schema";

const song: SongData = {
  id: "t", title: "t", sourceAudio: "/t.mp3", originalBpm: 120,
  verses: [{
    id: "v1", label: "V1", chunks: [
      { id: "A", label: "A", lines: [""], startSec: 0, endSec: 4, beats: 8 },
      { id: "B", label: "B", lines: [""], startSec: 4, endSec: 8, beats: 8 },
    ],
  }],
};

const listenAB: Step = { chunkIds: ["A","B"], phase: "listen", setIndex: 0, totalSets: 1, repIndex: 0, totalReps: 1 };

describe("scheduleStep", () => {
  it("16 clicks + 2 vocal segments for 2-chunk listen", () => {
    const ev = scheduleStep(listenAB, 120, song, 10);
    expect(ev.filter(e => e.kind === "click")).toHaveLength(16);
    expect(ev.filter(e => e.kind === "vocalSegment")).toHaveLength(2);
  });
  it("first click is at startAt, second is at startAt + spb", () => {
    const ev = scheduleStep(listenAB, 120, song, 10);
    const clicks = ev.filter(e => e.kind === "click");
    expect(clicks[0].time).toBeCloseTo(10);
    expect(clicks[1].time).toBeCloseTo(10.5);
  });
});

describe("stepDurationSec", () => {
  it("8 beats at 120 BPM = 4s", () => {
    const step: Step = { ...listenAB, chunkIds: ["A"] };
    expect(stepDurationSec(step, 120, song)).toBeCloseTo(4);
  });
});
