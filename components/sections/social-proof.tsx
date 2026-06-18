"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { Ornament } from "@/components/ui/ornament";
import { Section } from "@/components/ui/section";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "I ordered a personalized wooden keychain and I was honestly impressed with the quality. The engraving was precise and the item felt premium. It’s such a simple product but it felt very meaningful.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "M. Santos",
    role: "Customer",
  },
  {
    text: "Java Crafts exceeded my expectations. I requested a custom design for a birthday gift and they delivered exactly what I had in mind. The communication was smooth and the result was beautiful.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "J. Tibog",
    role: "Gift buyer",
  },
  {
    text: "I needed a last-minute gift and they still managed to deliver on time. The engraving was clean and professional. Highly recommended if you’re looking for something unique and personal.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "S. Minor",
    role: "Customer",
  },
  {
    text: "The wood grain on my order was gorgeous and the personalization looks hand-done, not machine-stamped. I’ve already sent two friends their way.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "A. Reyes",
    role: "Customer",
  },
  {
    text: "We used Java Crafts for small thank-you gifts for our team. Everyone commented on how thoughtful they felt—quality you can actually hold.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    name: "L. Chen",
    role: "Small business owner",
  },
  {
    text: "Clear updates, fair timeline, and the final piece looked like the photos but better in person. That’s rare for custom work online.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "D. Okonkwo",
    role: "Customer",
  },
  {
    text: "I’m picky about fonts and spacing—they matched my reference exactly. The packaging was neat too, ready to give as a gift.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "K. Park",
    role: "Gift buyer",
  },
  {
    text: "Ordered a keepsake for my parents’ anniversary. They tear up every time they see the engraving. Worth every peso.",
    image:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face",
    name: "R. Flores",
    role: "Customer",
  },
  {
    text: "No fluff—just solid craftsmanship and people who actually reply when you have a question. I’ll be back for the holidays.",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face",
    name: "N. Ibrahim",
    role: "Repeat customer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function SocialProof() {
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
          <span className="text-sm font-semibold text-brand-text">4.9 / 5</span>
          <span className="text-sm text-brand-muted">from 200+ happy orders</span>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-brand-muted">
          Real words from real customers — no fluff, no fake metrics.
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