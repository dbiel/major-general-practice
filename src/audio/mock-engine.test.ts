import { describe, it, expect } from "vitest";
import { MockAudioEngine } from "./mock-engine";
import type { Step } from "../controller/session";
import type { SongData } from "../data/schema";

const song: SongData = {
  id: "test",
  title: "Test",
  sourceAudio: "/test.mp3",
  originalBpm: 120,
  verses: [
    {
      id: "v1",
      label: "V1",
      chunks: [
        { id: "A", label: "A", lines: [""], startSec: 0, endSec: 4, beats: 8 },
        { id: "B", label: "B", lines: [""], startSec: 4, endSec: 8, beats: 8 },
      ],
    },
  ],
};

const listenAB: Step = {
  chunkIds: ["A", "B"], phase: "listen",
  setIndex: 2, totalSets: 3, repIndex: 0, totalReps: 5,
};

const repeatA: Step = {
  chunkIds: ["A"], phase: "repeat",
  setIndex: 0, totalSets: 3, repIndex: 0, totalReps: 5,
};

describe("MockAudioEngine", () => {
  it("playCountIn schedules 4 clicks", async () => {
    const eng = new MockAudioEngine();
    await eng.initialize(song);
    await eng.playCountIn(120);
    const clicks = eng.events.filter(e => e.kind === "click");
    expect(clicks).toHaveLength(4);
  });

  it("listen step schedules vocal segments + clicks", async () => {
    const eng = new MockAudioEngine();
    await eng.initialize(song);
    await eng.executeStep(listenAB, 120);
    const vocals = eng.events.filter(e => e.kind === "vocalSegment");
    expect(vocals).toHaveLength(2);
    expect(vocals[0]).toMatchObject({ chunkStartSec: 0, chunkEndSec: 4 });
    expect(vocals[1]).toMatchObject({ chunkStartSec: 4, chunkEndSec: 8 });
    const clicks = eng.events.filter(e => e.kind === "click");
    expect(clicks).toHaveLength(16); // 8 + 8 beats
  });

  it("repeat step schedules clicks only (no vocals)", async () => {
    const eng = new MockAudioEngine();
    await eng.initialize(song);
    await eng.executeStep(repeatA, 120);
    expect(eng.events.filter(e => e.kind === "vocalSegment")).toHaveLength(0);
    expect(eng.events.filter(e => e.kind === "click")).toHaveLength(8);
  });

  it("clicks have downbeat=true at beat 0 of each chunk", async () => {
    const eng = new MockAudioEngine();
    await eng.initialize(song);
    await eng.executeStep(listenAB, 120);
    const clicks = eng.events.filter(e => e.kind === "click");
    // beat 0 of chunk A → downbeat, beat 8 (= beat 0 of chunk B) → downbeat
    expect(clicks[0]).toMatchObject({ downbeat: true });
    expect(clicks[8]).toMatchObject({ downbeat: true });
    expect(clicks[1]).toMatchObject({ downbeat: false });
  });

  it("onBeat fires for every click", async () => {
    const eng = new MockAudioEngine();
    await eng.initialize(song);
    const beats: boolean[] = [];
    eng.onBeat(d => beats.push(d));
    await eng.executeStep(repeatA, 120);
    expect(beats).toHaveLength(8);
    expect(beats[0]).toBe(true);
    expect(beats[1]).toBe(false);
  });
});
