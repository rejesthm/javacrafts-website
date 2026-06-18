import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

export function CtaBand() {
  return (
    <Section className="pb-4 pt-6 sm:pb-8">
      <Reveal>
        <div className="texture-grain relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-secondary via-brand-primary to-brand-secondary px-6 py-12 text-center shadow-craft-lg sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl"
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold-soft">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight text-brand-bg sm:text-4xl">
            Let&apos;s make something they&apos;ll keep forever
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-bg/80">
            Upload a photo, add your words, and we&apos;ll handle the rest — with a proof
            before we ever start engraving.
          </p>
          <a
            href="#personalize"
            className="cta-sheen group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-gold px-8 text-sm font-semibold text-white shadow-craft transition hover:bg-brand-gold-soft hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-soft"
          >
            Start your keepsake
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
