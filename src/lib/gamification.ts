// src/lib/gamification.ts
// Pure functions for the gamification system. Keeping these pure (no Firebase
// calls) makes them easy to test and reuse on both client and server.

import type { BadgeLevel, CleanupPriority, UserProfile } from "./types";

/** Points awarded for a single contribution, weighted by cleanup priority. */
export function pointsForContribution(priority: CleanupPriority): number {
  const base = 10;
  const multiplier: Record<CleanupPriority, number> = {
    low: 1,
    medium: 1.5,
    high: 2,
    critical: 3,
  };
  return Math.round(base * multiplier[priority]);
}

/** Badge thresholds based on total uploads. Order matters (highest first). */
const BADGE_THRESHOLDS: { level: BadgeLevel; minUploads: number }[] = [
  { level: "platinum", minUploads: 100 },
  { level: "gold", minUploads: 50 },
  { level: "silver", minUploads: 20 },
  { level: "bronze", minUploads: 1 }, // "Eco Badge" earned on first upload
];

/** Returns every badge the user qualifies for at a given upload count. */
export function badgesForUploads(totalUploads: number): BadgeLevel[] {
  return BADGE_THRESHOLDS.filter((b) => totalUploads >= b.minUploads)
    .map((b) => b.level)
    .reverse(); // bronze -> platinum order
}

/** The single highest badge unlocked by reaching `totalUploads`, or null. */
export function newlyEarnedBadge(
  previousUploads: number,
  newUploads: number
): BadgeLevel | null {
  const before = new Set(badgesForUploads(previousUploads));
  const after = badgesForUploads(newUploads);
  const fresh = after.filter((b) => !before.has(b));
  return fresh.length ? fresh[fresh.length - 1] : null;
}

/** Local date key "YYYY-MM-DD" used for streak tracking. */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dayDiff(aKey: string, bKey: string): number {
  const a = new Date(aKey + "T00:00:00");
  const b = new Date(bKey + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Computes the next streak values given the last upload day. */
export function nextStreak(
  lastUploadDay: string | null,
  currentStreak: number,
  longestStreak: number,
  today = todayKey()
): { currentStreak: number; longestStreak: number; lastUploadDay: string } {
  let streak = 1;
  if (lastUploadDay) {
    const diff = dayDiff(lastUploadDay, today);
    if (diff === 0) streak = currentStreak; // already uploaded today
    else if (diff === 1) streak = currentStreak + 1; // consecutive day
    else streak = 1; // streak broken
  }
  return {
    currentStreak: streak,
    longestStreak: Math.max(longestStreak, streak),
    lastUploadDay: today,
  };
}

export const BADGE_META: Record<
  BadgeLevel,
  { label: string; emoji: string; color: string; requirement: string }
> = {
  bronze: { label: "Bronze", emoji: "\u{1F949}", color: "#cd7f32", requirement: "First upload" },
  silver: { label: "Silver", emoji: "\u{1F948}", color: "#9ca3af", requirement: "20 uploads" },
  gold: { label: "Gold", emoji: "\u{1F947}", color: "#f59e0b", requirement: "50 uploads" },
  platinum: { label: "Platinum", emoji: "\u{1F3C6}", color: "#38bdf8", requirement: "100 uploads" },
};

/** Convenience: derive a fresh profile snapshot after a new upload. */
export function applyUploadToProfile(
  profile: Pick<
    UserProfile,
    "totalUploads" | "ecoScore" | "currentStreak" | "longestStreak" | "lastUploadDay"
  >,
  priority: CleanupPriority
) {
  const totalUploads = profile.totalUploads + 1;
  const ecoScore = profile.ecoScore + pointsForContribution(priority);
  const streak = nextStreak(
    profile.lastUploadDay,
    profile.currentStreak,
    profile.longestStreak
  );
  const badges = badgesForUploads(totalUploads);
  const badgeEarned = newlyEarnedBadge(profile.totalUploads, totalUploads);
  return { totalUploads, ecoScore, badges, badgeEarned, ...streak };
}
