import { describe, it, expect } from "vitest";
import { secondsPerBeat, chunkDurationSec, clampBpm } from "./bpm";

describe("secondsPerBeat", () => {
  it("60 BPM = 1 second per beat", () => {
    expect(secondsPerBeat(60)).toBeCloseTo(1);
  });
  it("120 BPM = 0.5 seconds per beat", () => {
    expect(secondsPerBeat(120)).toBeCloseTo(0.5);
  });
});

describe("chunkDurationSec", () => {
  it("8 beats at 120 BPM = 4 seconds", () => {
    expect(chunkDurationSec(8, 120)).toBeCloseTo(4);
  });
  it("8 beats at 130 BPM = ~3.69 seconds", () => {
    expect(chunkDurationSec(8, 130)).toBeCloseTo(3.692, 2);
  });
});

describe("clampBpm", () => {
  it("clamps below floor", () => {
    expect(clampBpm(20, 40, 200)).toBe(40);
  });
  it("clamps above ceiling", () => {
    expect(clampBpm(300, 40, 200)).toBe(200);
  });
  it("returns value within range", () => {
    expect(clampBpm(100, 40, 200)).toBe(100);
  });
});
