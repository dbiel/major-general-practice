import { doc, getDoc, setDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

export type SongState = {
  selectedChunkIds: string[];
  bpm: number;
  repsPerSet: number;
  lastSessionId: string | null;
};

const DEFAULT_STATE: SongState = {
  selectedChunkIds: [],
  bpm: 90,
  repsPerSet: 5,
  lastSessionId: null,
};

const stateRef = (uid: string, songId: string) =>
  doc(db, "users", uid, "songs", songId);

export async function loadSongState(uid: string, songId: string): Promise<SongState> {
  const snap = await getDoc(stateRef(uid, songId));
  if (!snap.exists()) return { ...DEFAULT_STATE };
  return { ...DEFAULT_STATE, ...(snap.data() as Partial<SongState>) };
}

export async function saveSongState(uid: string, songId: string, state: SongState) {
  await setDoc(stateRef(uid, songId), { ...state, updatedAt: serverTimestamp() });
}

export type SessionRecord = {
  songId: string;
  chunkIds: string[];
  bpm: number;
  repsPerSet: number;
  lastCompletedStepIndex: number;
  completedAt: number | null;
};

export async function createSession(uid: string, rec: Omit<SessionRecord, "lastCompletedStepIndex" | "completedAt">) {
  const ref = await addDoc(collection(db, "users", uid, "sessions"), {
    ...rec,
    lastCompletedStepIndex: -1,
    completedAt: null,
    startedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSessionProgress(uid: string, sessionId: string, stepIndex: number, completed: boolean) {
  await updateDoc(doc(db, "users", uid, "sessions", sessionId), {
    lastCompletedStepIndex: stepIndex,
    ...(completed ? { completedAt: serverTimestamp() } : {}),
  });
}
