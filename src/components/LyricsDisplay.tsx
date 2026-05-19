import type { SongData } from "../data/schema";

type Props = { song: SongData; chunkIds: string[] };

export function LyricsDisplay({ song, chunkIds }: Props) {
  const lines = chunkIds.flatMap(id => {
    for (const v of song.verses) {
      const c = v.chunks.find(x => x.id === id);
      if (c) return c.lines;
    }
    return [];
  });
  const sizeClass =
    lines.length <= 2 ? "text-5xl" : lines.length <= 4 ? "text-4xl" : "text-3xl";
  return (
    <div className={`text-center font-semibold leading-snug ${sizeClass}`}>
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}
