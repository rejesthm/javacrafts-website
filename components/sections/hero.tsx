import Link from "next/link";
import { Section } from "@/components/ui/section";
import { AUDIENCE, LOCATION, OFFER } from "@/lib/site";

export function Hero() {
  return (
    <Section className="pb-12 pt-10 sm:pb-16 sm:pt-14">
      <div className="relative overflow-hidden rounded-3xl border border-brand-primary/25 bg-gradient-to-br from-brand-surface to-brand-bg px-6 py-12 shadow-sm sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-accent/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <p className="mb-4 inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-semibold text-brand-secondary">
            25% OFF on all items — limited-time welcome treat
          </p>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl lg:text-5xl">
            {OFFER}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-muted sm:text-xl">
            Built for {AUDIENCE}. Serving {LOCATION}.
          </p>
          <p className="mt-4 text-lg font-semibold text-brand-text">
            Personalized Engraved Gifts That Last a Lifetime
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#order"
              className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-full bg-brand-primary px-8 text-base font-bold text-white shadow-md transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Order Now
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand-primary/40 px-6 text-base font-semibold text-brand-secondary transition hover:border-brand-primary hover:bg-brand-primary/5"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
