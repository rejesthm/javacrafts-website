"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { Ornament } from "@/components/ui/ornament";
import { Section } from "@/components/ui/section";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import type { TestimonialsContent } from "@/lib/catalog";

export function SocialProof({ content }: { content: TestimonialsContent }) {
  const testimonials = content.testimonials
    .filter((testimonial) => testimonial.active)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  if (testimonials.length === 0) return null;

  return (
    <Section
      id="gallery"
      aria-labelledby="proof-heading"
      className="py-14 relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center max-w-[560px] mx-auto"
      >
        <Ornament className="mb-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Loved by gift-givers
        </p>
        <h2
          id="proof-heading"
          className="mt-4 text-balance text-center font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          Gifts that make people tear up (the good kind)
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-full border border-brand-gold/25 bg-brand-surface px-5 py-2.5 shadow-craft">
          <span className="flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-brand-gold text-brand-gold" />
            ))}
          </span>
          <span className="text-sm font-semibold text-brand-text">
            {content.summary.ratingText}
          </span>
          <span className="text-sm text-brand-muted">
            {content.summary.happyOrdersText}
          </span>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-brand-muted">
          Totoong reviews from real Pinoy customers — Tagalog, Bisaya, walang halong drama.
        </p>
      </motion.div>

      <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={15} />
        <TestimonialsColumn
          testimonials={secondColumn}
          className="hidden md:block"
          duration={19}
        />
        <TestimonialsColumn
          testimonials={thirdColumn}
          className="hidden lg:block"
          duration={17}
        />
      </div>
    </Section>
  );
}
