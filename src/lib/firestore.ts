// src/lib/firestore.ts
// All Firestore reads/writes live here so components stay clean.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  serverTimestamp,
  runTransaction,
  deleteDoc
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type {
  AnalysisResult,
  Contribution,
  MaterialType,
  UserProfile,
} from "./types";
import { applyUploadToProfile } from "./gamification";

const USERS = "users";
const CONTRIBUTIONS = "contributions";

/** Create the user profile doc on first sign-in if it doesn't exist yet. */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, USERS, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Eco Hero",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
    totalUploads: 0,
    ecoScore: 0,
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastUploadDay: null,
    createdAt: Date.now(),
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export interface NewContributionInput {
  userId: string;
  imageUrl: string;
  lat: number;
  lng: number;
  ai: AnalysisResult;
  // user-edited final values
  trashType: string;
  materialType: MaterialType;
  environmentalImpact: string;
  cleanupPriority: AnalysisResult["cleanupPriority"];
  userEdited: boolean;
  isPublic: boolean;
}

/**
 * Atomically: create the contribution AND update the user's stats/badges/streak.
 * Returns the new contribution id and the badge earned (if any) for the UI.
 */
export async function createContribution(
  input: NewContributionInput
): Promise<{ id: string; badgeEarned: Contribution["badgeEarned"] }> {
  const userRef = doc(db, USERS, input.userId);
  const contribRef = doc(collection(db, CONTRIBUTIONS));

  const badgeEarned = await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("User profile not found.");
    const profile = userSnap.data() as UserProfile;

    const updated = applyUploadToProfile(profile, input.cleanupPriority);

    tx.set(contribRef, {
      userId: input.userId,
      imageUrl: input.imageUrl,
      lat: input.lat,
      lng: input.lng,
      createdAt: serverTimestamp(),
      ai: input.ai,
      trashType: input.trashType,
      materialType: input.materialType,
      environmentalImpact: input.environmentalImpact,
      cleanupPriority: input.cleanupPriority,
      userEdited: input.userEdited,
      badgeEarned: updated.badgeEarned,
      isPublic: input.isPublic,
    });

    tx.update(userRef, {
      totalUploads: updated.totalUploads,
      ecoScore: updated.ecoScore,
      badges: updated.badges,
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      lastUploadDay: updated.lastUploadDay,
    });

    return updated.badgeEarned;
  });

  return { id: contribRef.id, badgeEarned };
}

function normalize(snapId: string, data: Record<string, unknown>): Contribution {
  const createdAt = data.createdAt as { toMillis?: () => number } | number | undefined;
  return {
    ...(data as Omit<Contribution, "id" | "createdAt">),
    id: snapId,
    createdAt:
      createdAt && typeof createdAt === "object" && createdAt.toMillis
        ? createdAt.toMillis()
        : (createdAt as number) ?? Date.now(),
  };
}

export async function getUserContributions(
  uid: string,
  max = 50
): Promise<Contribution[]> {
  const q = query(
    collection(db, CONTRIBUTIONS),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data()));
}

export async function getPublicContributions(
  material?: MaterialType,
  max = 500
): Promise<Contribution[]> {
  const clauses = [where("isPublic", "==", true)];
  if (material) clauses.push(where("materialType", "==", material));
  const q = query(
    collection(db, CONTRIBUTIONS),
    ...clauses,
    orderBy("createdAt", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data()));
}

export async function getContribution(id: string): Promise<Contribution | null> {
  const snap = await getDoc(doc(db, CONTRIBUTIONS, id));
  return snap.exists() ? normalize(snap.id, snap.data()) : null;
}

export async function updateUserPhoto(uid: string, photoURL: string): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { photoURL });
}

export async function deleteContribution(contributionId: string) {
  await deleteDoc(doc(db, "contributions", contributionId));
}

export async function deleteContributionAndRollback(
  contributionId: string,
  userId: string
) {
  const contribRef = doc(db, "contributions", contributionId);
  const userRef = doc(db, "users", userId);

  const contribSnap = await getDoc(contribRef);
  if (!contribSnap.exists()) return;

  const data = contribSnap.data();

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) return;

    const user = userSnap.data();

    tx.delete(contribRef);

    tx.update(userRef, {
      totalUploads: Math.max(0, (user.totalUploads || 0) - 1),

      // simple ecoScore rollback (adjust if your logic differs)
      ecoScore: Math.max(0, (user.ecoScore || 0) - 10),
    });
  });
}