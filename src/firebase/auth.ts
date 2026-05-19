import { signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "./client";

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);

export type AuthUser = User;
