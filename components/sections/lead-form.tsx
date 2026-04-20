"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Section } from "@/components/ui/section";
import { GHL_PAGE_SLUG_HOME, OFFER } from "@/lib/site";

export function LeadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/ghl-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          pageSlug: GHL_PAGE_SLUG_HOME,
          offer: OFFER,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/thank-you");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Section id="order" aria-labelledby="order-heading" className="py-14">
      <div className="mx-auto max-w-xl rounded-3xl border border-brand-primary/25 bg-brand-surface p-6 shadow-lg sm:p-10">
        <h2
          id="order-heading"
          className="text-center text-3xl font-extrabold tracking-tight text-brand-text"
        >
          Ready to make it personal?
        </h2>
        <p className="mt-3 text-center text-lg text-brand-muted">
          Drop your details—we’ll follow up to confirm engraving and next steps.
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-brand-text">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-xl border border-brand-primary/30 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-xl border border-brand-primary/30 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-brand-text">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-xl border border-brand-primary/30 bg-brand-bg px-4 py-2 text-brand-text placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              placeholder="09xx xxx xxxx"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full min-h-12 items-center justify-center rounded-full bg-brand-primary text-base font-bold text-white shadow-md transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {pending ? "Sending…" : "Order Now"}
          </button>
        </form>
      </div>
    </Section>
  );
}
