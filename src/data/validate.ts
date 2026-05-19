import type { SongData } from "./schema";

export function validateSongData(data: unknown): asserts data is SongData {
  if (!data || typeof data !== "object") throw new Error("song data must be an object");
  const d = data as SongData;
  if (typeof d.id !== "string" || !d.id) throw new Error("song id required");
  if (typeof d.title !== "string" || !d.title) throw new Error("title required");
  if (typeof d.sourceAudio !== "string" || !d.sourceAudio) throw new Error("sourceAudio required");
  if (typeof d.originalBpm !== "number" || d.originalBpm <= 0) {
    throw new Error("originalBpm must be > 0");
  }
  if (!Array.isArray(d.verses) || d.verses.length === 0) throw new Error("at least one verse required");

  const seenIds = new Set<string>();
  for (const verse of d.verses) {
    for (const chunk of verse.chunks) {
      if (seenIds.has(chunk.id)) throw new Error(`duplicate chunk id: ${chunk.id}`);
      seenIds.add(chunk.id);
      if (chunk.startSec >= chunk.endSec) {
        throw new Error(`chunk ${chunk.id}: startSec must be < endSec`);
      }
      if (chunk.beats <= 0) throw new Error(`chunk ${chunk.id}: beats must be > 0`);
      if (!Array.isArray(chunk.lines) || chunk.lines.length === 0) {
        throw new Error(`chunk ${chunk.id}: lines required`);
      }
    }
  }
}
