// src/app/profile/[uid]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { Spinner } from "@/components/ui/Spinner";
import { getUserProfile, getUserContributions } from "@/lib/firestore";
import type { Contribution, UserProfile } from "@/lib/types";

export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    Promise.all([getUserProfile(uid), getUserContributions(uid)])
      .then(([p, c]) => {
        setProfile(p);
        // Only show public contributions on a public profile.
        setContributions(c.filter((x) => x.isPublic));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Spinner className="h-8 w-8" /></div>;
  }
  if (!profile) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="text-muted">Profile not found.</p>
      </div>
    );
  }
  return <ProfileView profile={profile} contributions={contributions} />;
}
