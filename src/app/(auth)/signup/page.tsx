// src/app/(auth)/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signUpWithEmail, loginWithGoogle, authErrorMessage } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { FirebaseError } from "firebase/app";

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  useEffect(() => {
    if (user) router.replace("/upload");
  }, [user, router]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading("email");
    try {
      await signUpWithEmail(email, password, name);
      router.push("/upload");
    } catch (err) {
      setError(err instanceof FirebaseError ? authErrorMessage(err.code) : "Sign up failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading("google");
    try {
      await loginWithGoogle();
      router.push("/upload");
    } catch (err) {
      setError(err instanceof FirebaseError ? authErrorMessage(err.code) : "Sign up failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-muted">Start building the map of pollution.</p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="text" required placeholder="Display name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <input
            type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <input
            type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <Button type="submit" loading={loading === "email"} className="w-full">Create account</Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-brand-100" /> or <div className="h-px flex-1 bg-brand-100" />
        </div>

        <Button variant="outline" onClick={handleGoogle} loading={loading === "google"} className="w-full">
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
