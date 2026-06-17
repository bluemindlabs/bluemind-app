// src/app/profile/page.tsx
"use client";

import { cleanText } from "@/lib/text";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileView } from "@/components/profile/ProfileView";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserContributions } from "@/lib/firestore";
import type { Contribution } from "@/lib/types";

function ProfileInner() {
  const { user, profile } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  console.log("USER:", user?.uid);
  console.log("UPLOADS:", contributions);

  useEffect(() => {
    if (!user) return;
    getUserContributions(user.uid)
      .then(setContributions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  function copyProfileLink() {
    if (!user) return;
    const url = `${window.location.origin}/profile/${user.uid}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!profile || loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h1 className="font-display text-3xl font-bold text-ink">Your profile</h1>
        <Button variant="outline" onClick={copyProfileLink}>
          <LinkIcon className="h-4 w-4" /> {copied ? "Copied!" : "Share profile"}
        </Button>
      </div>
      <ProfileView profile={profile} contributions={contributions} showShare />
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileInner />
    </ProtectedRoute>
  );
}
