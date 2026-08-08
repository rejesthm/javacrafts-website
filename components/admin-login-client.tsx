"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Coffee, LogIn } from "lucide-react";

import {
  getFirebaseClientAuth,
  hasFirebaseClientConfig,
} from "@/lib/firebase/client";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hasFirebaseClientConfig()) {
      setError(
        "Firebase web config is missing. Add the NEXT_PUBLIC_FIREBASE_* env values first."
      );
      return;
    }

    setPending(true);
    const auth = getFirebaseClientAuth();
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const idToken = await credential.user.getIdToken();
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        await signOut(auth).catch(() => undefined);
        setError(data.error ?? "This admin account is not allowed here.");
        return;
      }
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Admin sign-in did not finish. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="bg-white rounded-2xl border border-[#e5ded5] shadow-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-brand-gold flex-shrink-0">
            <Coffee className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-brand-text leading-tight">
              Java Crafts
            </p>
            <p className="text-xs text-brand-muted">Admin Portal</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-brand-text">Sign in</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Access the Java Crafts admin dashboard.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={onLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-brand-text mb-1.5"
            >
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-[#e5ded5] bg-white px-3.5 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-brand-text mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#e5ded5] bg-white px-3.5 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <LogIn className="size-4" aria-hidden />
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
