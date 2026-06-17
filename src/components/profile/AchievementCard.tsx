// src/components/profile/AchievementCard.tsx
"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BADGE_META } from "@/lib/gamification";
import type { UserProfile } from "@/lib/types";

/** Renders a branded card the user can download or share to socials. */
export function AchievementCard({ profile }: { profile: UserProfile }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const topBadge = profile.badges[profile.badges.length - 1];

  const generate = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
  };

  const download = async () => {
    setBusy(true);
    try {
      const url = await generate();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `bluemind-${profile.displayName}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const url = await generate();
      if (!url) return;
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "bluemind.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My BlueMind impact",
          text: `I've logged ${profile.totalUploads} litter reports on BlueMind! \u{1F30A}`,
        });
      } else {
        await download();
      }
    } catch {
      /* user cancelled share */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">
          BlueMind Impact
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold">{profile.displayName}</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Reports" value={profile.totalUploads} />
          <Stat label="Eco Score" value={profile.ecoScore} />
          <Stat label="Streak" value={`${profile.currentStreak}d`} />
        </div>
        {topBadge && (
          <p className="mt-4 text-sm">
            {BADGE_META[topBadge].emoji} {BADGE_META[topBadge].label} contributor
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={download} loading={busy} className="flex-1">
          <Download className="h-4 w-4" /> Save card
        </Button>
        <Button onClick={share} loading={busy} className="flex-1">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2 text-center">
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-brand-100">{label}</p>
    </div>
  );
}
