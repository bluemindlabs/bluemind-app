// src/lib/auth.ts
// Authentication helpers wrapping Firebase Auth.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { ensureUserProfile } from "./firestore";

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Turn Firebase error codes into friendly messages. */
export function authErrorMessage(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered. Try logging in.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}
