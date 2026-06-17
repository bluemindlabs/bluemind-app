// src/components/profile/ProfileView.tsx
"use client";

import { deleteContributionAndRollback } from "@/lib/firestore";
import { cleanText } from "@/lib/text";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { BadgeDisplay } from "@/components/profile/BadgeDisplay";
import { AchievementCard } from "@/components/profile/AchievementCard";
import { Flame, Leaf, Upload as UploadIcon } from "lucide-react";
import type { Contribution, UserProfile } from "@/lib/types";

const CommunityMap = dynamic(() => import("@/components/map/CommunityMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center"><Spinner /></div>,
});

export function ProfileView({
  profile,
  contributions,
  showShare = false,
}: {
  profile: UserProfile;
  contributions: Contribution[];
  showShare?: boolean;
}) {
  const center: [number, number] | undefined =
    contributions.length > 0 ? [contributions[0].lat, contributions[0].lng] : undefined;

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <Card className="flex items-center gap-4">
        {profile.photoURL ? (
          <Image
            src={profile.photoURL}
            alt={profile.displayName}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{profile.displayName}</h1>
          <p className="text-sm text-muted">Eco contributor</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={UploadIcon} label="Reports" value={profile.totalUploads} />
        <StatTile icon={Leaf} label="Eco Score" value={profile.ecoScore} />
        <StatTile icon={Flame} label="Streak" value={`${profile.currentStreak}d`} />
      </div>

      {/* Badges */}
      <Card className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Badges</h2>
        <BadgeDisplay earned={profile.badges} />
      </Card>

      {/* Shareable card (own profile only) */}
      {showShare && (
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-bold text-ink">Share your impact</h2>
          <AchievementCard profile={profile} />
        </Card>
      )}

      {/* Contribution map */}
      {contributions.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-bold text-ink">Contribution map</h2>
          <div className="h-72 overflow-hidden rounded-2xl">
            <div className="flex h-full items-center justify-center">
              Map temporarily disabled
            </div>
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Upload history</h2>
        {contributions.length === 0 ? (
          <p className="text-sm text-muted">No reports yet.</p>
        ) : (
          <ul className="divide-y divide-brand-100">
            {contributions.map((c) => (
              <li key={c.id}>
                <Link href={`/contribution/${c.id}`} className="flex items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imageUrl} alt={c.trashType} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{c.trashType}</p>
                    <p className="text-xs capitalize text-muted">
                      {c.materialType} {c.cleanupPriority} priority
                    </p>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(typeof c.createdAt === "number" ? c.createdAt : Date.now()).toLocaleDateString()}
                   <button onClick={async () => { await deleteContributionAndRollback(c.id, c.userId); window.location.reload(); }} className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Delete
                  </button>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass rounded-3xl p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-brand-500" />
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
