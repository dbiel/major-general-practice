import { describe, it, expect } from "vitest";
import { validateSongData } from "./validate";
import song from "./songs/major-general.json";

const valid = {
  id: "test",
  title: "Test",
  sourceAudio: "/audio/test.mp3",
  originalBpm: 120,
  verses: [
    {
      id: "v1",
      label: "Verse 1",
      chunks: [
        { id: "v1-A", label: "A", lines: ["one", "two"], startSec: 0, endSec: 4, beats: 8 },
        { id: "v1-B", label: "B", lines: ["three", "four"], startSec: 4, endSec: 8, beats: 8 },
      ],
    },
  ],
};

describe("validateSongData", () => {
  it("accepts a valid song", () => {
    expect(() => validateSongData(valid)).not.toThrow();
  });

  it("rejects when startSec >= endSec", () => {
    const bad = structuredClone(valid);
    bad.verses[0].chunks[0].endSec = 0;
    expect(() => validateSongData(bad)).toThrow(/startSec/);
  });

  it("rejects when beats <= 0", () => {
    const bad = structuredClone(valid);
    bad.verses[0].chunks[0].beats = 0;
    expect(() => validateSongData(bad)).toThrow(/beats/);
  });

  it("rejects duplicate chunk ids", () => {
    const bad = structuredClone(valid);
    bad.verses[0].chunks[1].id = "v1-A";
    expect(() => validateSongData(bad)).toThrow(/duplicate/);
  });

  it("rejects originalBpm <= 0", () => {
    const bad = structuredClone(valid);
    bad.originalBpm = 0;
    expect(() => validateSongData(bad)).toThrow(/originalBpm/);
  });
});

describe("major-general.json", () => {
  it("validates", () => {
    expect(() => validateSongData(song)).not.toThrow();
  });
});
