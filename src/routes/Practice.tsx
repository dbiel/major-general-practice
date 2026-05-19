import { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import song from "../data/songs/major-general.json";
import type { SongData } from "../data/schema";
import { useAuth } from "../hooks/useAuth";
import { useSongState } from "../hooks/useSongState";
import { useSession } from "../hooks/useSession";
import { useWakeLock } from "../hooks/useWakeLock";
import { WebAudioEngine } from "../audio/webaudio-engine";
import { PhasePill } from "../components/PhasePill";
import { LyricsDisplay } from "../components/LyricsDisplay";
import { VisualMetronome } from "../components/VisualMetronome";
import { DriveControls } from "../components/DriveControls";

const SONG_ID = "major-general";
const BPM_MIN = 40;
const BPM_MAX = Math.round((song as SongData).originalBpm * 1.1);

export function PracticeRoute() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { state } = useSongState(user?.uid, SONG_ID);
  const navigate = useNavigate();
  useWakeLock();

  const engine = useMemo(() => new WebAudioEngine(), []);
  const beatCbRef = useRef<(d: boolean) => void>(() => {});
  engine.onBeat((d) => beatCbRef.current(d));
  const subscribe = (cb: (d: boolean) => void) => { beatCbRef.current = cb; };

  if (!user || !state || !sessionId) {
    return <div className="p-6 text-2xl">Loading…</div>;
  }

  return (
    <PracticeInner
      engine={engine}
      song={song as SongData}
      chunkIds={state.selectedChunkIds}
      bpm={state.bpm}
      repsPerSet={state.repsPerSet}
      uid={user.uid}
      sessionId={sessionId}
      subscribeBeat={subscribe}
      onExit={() => navigate("/setup")}
    />
  );
}

type InnerProps = {
  engine: WebAudioEngine;
  song: SongData;
  chunkIds: string[];
  bpm: number;
  repsPerSet: number;
  uid: string;
  sessionId: string;
  subscribeBeat: (cb: (d: boolean) => void) => void;
  onExit: () => void;
};

function PracticeInner(p: InnerProps) {
  const session = useSession({
    engine: p.engine,
    song: p.song,
    chunkIds: p.chunkIds,
    initialBpm: p.bpm,
    repsPerSet: p.repsPerSet,
    uid: p.uid,
    sessionId: p.sessionId,
  });

  useEffect(() => () => p.engine.stop(), [p.engine]);

  if (session.completed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
        <div className="text-4xl font-bold">Session complete</div>
        <button onClick={p.onExit} className="rounded-2xl bg-green-600 px-8 py-5 text-2xl font-bold">
          Back to setup
        </button>
      </div>
    );
  }

  const step = session.step;
  return (
    <div className="flex h-full flex-col p-4">
      <VisualMetronome engineBeatSubscribe={p.subscribeBeat} />
      <header className="flex items-center justify-between pb-4">
        {step && <PhasePill phase={step.phase} />}
        <div className="text-sm text-neutral-400">
          {step && (
            <>Set {step.setIndex + 1}/{step.totalSets} · Rep {step.repIndex + 1}/{step.totalReps} · {step.chunkIds.join("")}</>
          )}
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center">
        {step && <LyricsDisplay song={p.song} chunkIds={step.chunkIds} />}
      </div>

      <div className="pt-4">
        <DriveControls
          bpm={session.bpm}
          bpmMin={BPM_MIN}
          bpmMax={BPM_MAX}
          paused={session.paused}
          onBpmChange={session.setBpm}
          onTogglePause={() => (session.paused ? session.start() : session.pause())}
          onSkipSet={session.skipSet}
        />
      </div>
    </div>
  );
}
