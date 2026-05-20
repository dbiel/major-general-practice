import { useEffect, useMemo, useRef, useState } from "react";
import { buildQueue, type Step } from "../controller/session";
import type { AudioEngine } from "../audio/engine";
import type { SongData } from "../data/schema";
import { updateSessionProgress } from "../firebase/state";

export type SessionRuntimeState = {
  step: Step | null;
  stepIndex: number;
  totalSteps: number;
  paused: boolean;
  bpm: number;
  completed: boolean;
};

export type UseSessionParams = {
  engine: AudioEngine;
  song: SongData;
  chunkIds: string[];
  initialBpm: number;
  repsPerSet: number;
  uid: string;
  sessionId: string;
};

export function useSession(params: UseSessionParams) {
  const queue = useMemo(
    () => buildQueue(params.chunkIds, params.repsPerSet),
    [params.chunkIds, params.repsPerSet]
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [bpm, setBpm] = useState(params.initialBpm);
  const [completed, setCompleted] = useState(false);
  const pausedRef = useRef(paused);
  const bpmRef = useRef(bpm);
  const stepIndexRef = useRef(stepIndex);
  const initializedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { stepIndexRef.current = stepIndex; }, [stepIndex]);

  const runner = useRef<Promise<void> | null>(null);

  const start = async () => {
    if (!initializedRef.current) {
      await params.engine.initialize(params.song);
      initializedRef.current = true;
      await params.engine.playCountIn(bpmRef.current);
    }
    // Sync the ref immediately so the loop doesn't sleep 150ms waiting for the
    // setPaused state update to propagate — the engine resolved playCountIn
    // early specifically so we can schedule the next step without a gap.
    pausedRef.current = false;
    setPaused(false);
    if (!runner.current) runner.current = loop();
  };

  const pause = () => {
    pausedRef.current = true;
    setPaused(true);
    params.engine.stop();
  };

  const skipSet = () => {
    const curr = queue[stepIndexRef.current];
    if (!curr) return;
    let i = stepIndexRef.current + 1;
    while (i < queue.length && queue[i].setIndex === curr.setIndex) i++;
    stepIndexRef.current = i;
    setStepIndex(i);
    params.engine.stop();
  };

  async function loop() {
    while (stepIndexRef.current < queue.length) {
      if (pausedRef.current) {
        await sleep(150);
        continue;
      }
      const step = queue[stepIndexRef.current];
      await params.engine.executeStep(step, bpmRef.current);
      updateSessionProgress(params.uid, params.sessionId, stepIndexRef.current, false).catch(() => {/* ignore */});
      const next = stepIndexRef.current + 1;
      stepIndexRef.current = next;
      setStepIndex(next);
    }
    setCompleted(true);
    setPaused(true);
    updateSessionProgress(params.uid, params.sessionId, queue.length - 1, true).catch(() => {});
  }

  return {
    step: queue[stepIndex] ?? null,
    stepIndex,
    totalSteps: queue.length,
    paused,
    bpm,
    completed,
    setBpm,
    start,
    pause,
    skipSet,
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
