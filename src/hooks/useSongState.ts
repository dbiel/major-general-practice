import { useCallback, useEffect, useState } from "react";
import { loadSongState, saveSongState, type SongState } from "../firebase/state";

export function useSongState(uid: string | undefined, songId: string) {
  const [state, setState] = useState<SongState | null>(null);

  useEffect(() => {
    if (!uid) return;
    loadSongState(uid, songId).then(setState);
  }, [uid, songId]);

  const update = useCallback(async (patch: Partial<SongState>) => {
    if (!uid || !state) return;
    const next = { ...state, ...patch };
    setState(next);
    await saveSongState(uid, songId, next);
  }, [uid, songId, state]);

  return { state, update };
}
