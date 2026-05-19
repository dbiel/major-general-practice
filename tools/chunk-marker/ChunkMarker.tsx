import { useRef, useState } from "react";

type Mark = { chunkLabel: string; startSec: number; endSec: number | null; beats: number };

export function ChunkMarker() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [label, setLabel] = useState("A");

  const t = () => audioRef.current?.currentTime ?? 0;

  const startChunk = () => {
    setMarks((m) => [...m, { chunkLabel: label, startSec: t(), endSec: null, beats: 8 }]);
  };
  const endChunk = () => {
    setMarks((m) => {
      const last = m[m.length - 1];
      if (!last || last.endSec !== null) return m;
      return [...m.slice(0, -1), { ...last, endSec: t() }];
    });
  };
  const updateBeats = (i: number, beats: number) => {
    setMarks((m) => m.map((x, j) => (j === i ? { ...x, beats } : x)));
  };

  const exportJson = () => {
    const out = marks
      .filter(m => m.endSec !== null)
      .map(m => ({
        id: `v1-${m.chunkLabel}`,
        label: m.chunkLabel,
        lines: ["", ""],
        startSec: round(m.startSec),
        endSec: round(m.endSec!),
        beats: m.beats,
      }));
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    alert(`Copied ${out.length} chunks to clipboard`);
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Chunk Marker</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && audioRef.current) audioRef.current.src = URL.createObjectURL(f);
        }}
      />
      <audio ref={audioRef} controls className="w-full" />

      <div className="flex items-center gap-2">
        <label>Label:</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-16 bg-neutral-800 px-2 py-1" />
        <button onClick={startChunk} className="rounded bg-yellow-600 px-3 py-1">Mark start</button>
        <button onClick={endChunk} className="rounded bg-green-600 px-3 py-1">Mark end</button>
        <button onClick={exportJson} className="rounded bg-blue-600 px-3 py-1">Copy JSON</button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-neutral-400"><th>Label</th><th>Start</th><th>End</th><th>Beats</th></tr>
        </thead>
        <tbody>
          {marks.map((m, i) => (
            <tr key={i}>
              <td>{m.chunkLabel}</td>
              <td>{round(m.startSec)}</td>
              <td>{m.endSec === null ? "…" : round(m.endSec)}</td>
              <td>
                <input
                  type="number"
                  value={m.beats}
                  onChange={(e) => updateBeats(i, parseInt(e.target.value) || 0)}
                  className="w-16 bg-neutral-800 px-2 py-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const round = (n: number) => Math.round(n * 100) / 100;
