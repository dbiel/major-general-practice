import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSongState } from "../hooks/useSongState";
import { ChunkSelector } from "../components/ChunkSelector";
import { BpmControl } from "../components/BpmControl";
import { RepsControl } from "../components/RepsControl";
import { createSession } from "../firebase/state";
import song from "../data/songs/major-general.json";
import type { SongData } from "../data/schema";

const SONG_ID = "major-general";
const BPM_MIN = 40;
const BPM_MAX = Math.round((song as SongData).originalBpm * 1.1);

export function SetupRoute() {
  const { user } = useAuth();
  const { state, update } = useSongState(user?.uid, SONG_ID);
  const navigate = useNavigate();

  if (!user || !state) return <div className="p-6 text-2xl">Loading…</div>;
  const canStart = state.selectedChunkIds.length > 0;

  const onStart = async () => {
    const sessionId = await createSession(user.uid, {
      songId: SONG_ID,
      chunkIds: state.selectedChunkIds,
      bpm: state.bpm,
      repsPerSet: state.repsPerSet,
    });
    await update({ lastSessionId: sessionId });
    navigate(`/practice/${sessionId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">{song.title}</h1>

      <ChunkSelector
        song={song as SongData}
        selected={state.selectedChunkIds}
        onChange={ids => update({ selectedChunkIds: ids })}
      />

      <div className="space-y-2">
        <div className="text-center text-sm uppercase tracking-wider text-neutral-400">Tempo</div>
        <BpmControl
          bpm={state.bpm}
          min={BPM_MIN}
          max={BPM_MAX}
          onChange={bpm => update({ bpm })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-center text-sm uppercase tracking-wider text-neutral-400">Reps per set</div>
        <RepsControl reps={state.repsPerSet} onChange={n => update({ repsPerSet: n })} />
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={onStart}
        className="w-full rounded-2xl bg-green-600 py-6 text-2xl font-bold disabled:opacity-40"
      >
        Start practice
      </button>
    </div>
  );
}
