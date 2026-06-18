"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signOut } from "firebase/auth";
import { LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createGoogleProvider,
  getFirebaseClientAuth,
  hasFirebaseClientConfig,
} from "@/lib/firebase/client";

export function AdminLoginClient() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setError(null);
    if (!hasFirebaseClientConfig()) {
      setError("Firebase web config is missing. Add the NEXT_PUBLIC_FIREBASE_* env values first.");
      return;
    }

    setPending(true);
    const auth = getFirebaseClientAuth();
    try {
      const credential = await signInWithPopup(auth, createGoogleProvider());
      const idToken = await credential.user.getIdToken();
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        await signOut(auth).catch(() => undefined);
        setError(data.error ?? "This Google account is not allowed here.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in did not finish. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-brand-gold/15 bg-brand-surface p-6 shadow-craft ring-1 ring-brand-gold/5 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20">
        <ShieldCheck className="size-6" aria-hidden />
      </div>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-brand-text">
        Admin login
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-muted">
        Sign in with the authorized Java Crafts Google account to view checkout orders.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-[16px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={onLogin}
        disabled={pending}
        className="mt-6 min-h-12 w-full rounded-full bg-brand-primary text-brand-bg shadow-craft hover:bg-brand-secondary"
      >
        <LogIn className="mr-2 size-4" aria-hidden />
        {pending ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
}
