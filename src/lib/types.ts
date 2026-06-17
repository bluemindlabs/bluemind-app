// src/lib/types.ts
// Central type definitions used across the whole app.

import type { Timestamp } from "firebase/firestore";

export type BadgeLevel = "bronze" | "silver" | "gold" | "platinum";

export type CleanupPriority = "low" | "medium" | "high" | "critical";

export type MaterialType =
  | "plastic"
  | "glass"
  | "metal"
  | "paper"
  | "organic"
  | "electronic"
  | "hazardous"
  | "mixed"
  | "other";

/** What Gemini returns when it analyses an image. Also the editable fields the user can override. */
export interface AnalysisResult {
  trashType: string; // e.g. "Plastic water bottle"
  materialType: MaterialType; // classification
  environmentalImpact: string; // short paragraph
  cleanupPriority: CleanupPriority;
}

/** A single trash report stored in Firestore (collection: "contributions"). */
export interface Contribution {
  id: string;
  userId: string;
  imageUrl: string;
  lat: number;
  lng: number;
  // Firestore stores a Timestamp; in the client we usually convert to millis.
  createdAt: Timestamp | number;
  // AI output (original, untouched) + the user-edited final values.
  ai: AnalysisResult;
  trashType: string;
  materialType: MaterialType;
  environmentalImpact: string;
  cleanupPriority: CleanupPriority;
  userEdited: boolean;
  badgeEarned: BadgeLevel | null; // badge unlocked *by* this upload, if any
  isPublic: boolean;
}

/** A user profile document (collection: "users", doc id = uid). */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  totalUploads: number;
  ecoScore: number;
  badges: BadgeLevel[];
  currentStreak: number; // consecutive days with an upload
  longestStreak: number;
  lastUploadDay: string | null; // "YYYY-MM-DD" in user's local time
  createdAt: Timestamp | number;
}
