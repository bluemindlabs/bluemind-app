// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { loginWithEmail, loginWithGoogle, authErrorMessage } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
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
      await loginWithEmail(email, password);
      router.push("/upload");
    } catch (err) {
      setError(err instanceof FirebaseError ? authErrorMessage(err.code) : "Login failed.");
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
      setError(err instanceof FirebaseError ? authErrorMessage(err.code) : "Login failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to keep mapping.</p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <input
            type="password" required placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <Button type="submit" loading={loading === "email"} className="w-full">Sign in</Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-brand-100" /> or <div className="h-px flex-1 bg-brand-100" />
        </div>

        <Button variant="outline" onClick={handleGoogle} loading={loading === "google"} className="w-full">
          <GoogleIcon /> Continue with Google
        </Button>

        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-600">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.9 35.6 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
