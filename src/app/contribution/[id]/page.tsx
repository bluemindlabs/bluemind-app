// src/app/contribution/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Share2 } from "lucide-react";
import { getContribution } from "@/lib/firestore";
import type { Contribution, CleanupPriority } from "@/lib/types";

const CommunityMap = dynamic(() => import("@/components/map/CommunityMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center"><Spinner /></div>,
});

const PRIORITY_BADGE: Record<CleanupPriority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-brand-100 text-brand-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

export default function ContributionPage() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getContribution(id).then(setC).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: c?.trashType ?? "BlueMind report", url });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><Spinner className="h-8 w-8" /></div>;
  if (!c) return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted">Report not found.</p></div>;

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4">
      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.imageUrl} alt={c.trashType} className="h-64 w-full object-cover" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{c.trashType}</h1>
            <p className="text-sm capitalize text-muted">{c.materialType}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${PRIORITY_BADGE[c.cleanupPriority]}`}>
            {c.cleanupPriority} priority
          </span>
        </div>
        <p className="text-sm text-ink">{c.environmentalImpact}</p>
        <Button variant="outline" onClick={share} className="w-full">
          <Share2 className="h-4 w-4" /> Share this report
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Location</h2>
        <div className="h-56 overflow-hidden rounded-2xl">
          <CommunityMap contributions={[c]} center={[c.lat, c.lng]} zoom={15} />
        </div>
      </Card>
    </div>
  );
}
