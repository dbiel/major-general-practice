import type { SongData } from "../data/schema";

type Props = {
  song: SongData;
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ChunkSelector({ song, selected, onChange }: Props) {
  const toggle = (chunkId: string) => {
    onChange(
      selected.includes(chunkId)
        ? selected.filter(id => id !== chunkId)
        : [...selected, chunkId]
    );
  };

  return (
    <div className="space-y-4">
      {song.verses.map(verse => (
        <section key={verse.id} className="rounded-xl bg-neutral-900 p-4">
          <header className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-semibold">{verse.label}</h2>
            <button
              type="button"
              onClick={() => onChange(Array.from(new Set([...selected, ...verse.chunks.map(c => c.id)])))}
              className="text-sm text-blue-400 underline"
              aria-label={`Select all in ${verse.label}`}
            >
              Select all
            </button>
          </header>
          <ul className="space-y-2">
            {verse.chunks.map(chunk => (
              <li key={chunk.id}>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(chunk.id)}
                    onChange={() => toggle(chunk.id)}
                    aria-label={`${chunk.label}: ${chunk.lines[0]}`}
                    className="mt-1 h-6 w-6"
                  />
                  <div>
                    <div className="font-semibold">{chunk.label}</div>
                    <div className="text-neutral-300">{chunk.lines[0]}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
