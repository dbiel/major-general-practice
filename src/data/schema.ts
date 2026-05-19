export type Chunk = {
  id: string;
  label: string;
  lines: string[];
  startSec: number;
  endSec: number;
  beats: number;
};

export type Verse = {
  id: string;
  label: string;
  chunks: Chunk[];
};

export type SongData = {
  id: string;
  title: string;
  sourceAudio: string;
  originalBpm: number;
  verses: Verse[];
};
