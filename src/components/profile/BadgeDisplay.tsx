// src/components/profile/BadgeDisplay.tsx
"use client";
import { BADGE_META } from "@/lib/gamification";
import type { BadgeLevel } from "@/lib/types";

const ALL: BadgeLevel[] = ["bronze", "silver", "gold", "platinum"];

export function BadgeDisplay({ earned }: { earned: BadgeLevel[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {ALL.map((b) => {
        const has = earned.includes(b);
        const meta = BADGE_META[b];
        return (
          <div
            key={b}
            className={`flex flex-col items-center rounded-2xl border p-3 text-center transition ${
              has
                ? "border-brand-200 bg-white"
                : "border-dashed border-slate-200 bg-slate-50/60 opacity-60"
            }`}
            title={meta.requirement}
          >
            <span className="text-2xl" style={{ filter: has ? "none" : "grayscale(1)" }}>
              {meta.emoji}
            </span>
            <span className="mt-1 text-xs font-semibold text-ink">{meta.label}</span>
            <span className="text-[10px] text-muted">{meta.requirement}</span>
          </div>
        );
      })}
    </div>
  );
}
