// src/app/map/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import { getPublicContributions } from "@/lib/firestore";
import type { Contribution, MaterialType } from "@/lib/types";

const CommunityMap = dynamic(() => import("@/components/map/CommunityMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center"><Spinner className="h-8 w-8" /></div>
  ),
});

const FILTERS: (MaterialType | "all")[] = [
  "all", "plastic", "glass", "metal", "paper", "organic", "electronic", "hazardous", "mixed", "other",
];

export default function MapPage() {
  const [all, setAll] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MaterialType | "all">("all");

  useEffect(() => {
    getPublicContributions()
      .then(setAll)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? all : all.filter((c) => c.materialType === filter)),
    [all, filter]
  );

  return (
    <div className="space-y-4 py-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Community map</h1>
        <p className="text-sm text-muted">
          {loading ? "Loading reports\u2026" : `${filtered.length} reports shown`}
        </p>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
              filter === f ? "bg-brand-500 text-white" : "bg-white/70 text-brand-700 border border-brand-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="h-[70vh] overflow-hidden rounded-[2rem] border border-brand-100">
        {loading ? (
          <div className="grid h-full place-items-center"><Spinner className="h-8 w-8" /></div>
        ) : (
          <CommunityMap contributions={filtered} />
        )}
      </div>
    </div>
  );
}
