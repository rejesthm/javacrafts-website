"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

import { Ornament } from "@/components/ui/ornament";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

const faqs = [
  {
    q: "How does the customization process work?",
    a: "After you add your item, you'll share the photo, name, date, or message you want engraved. For custom designs you can upload a file or simply describe your idea. We confirm every detail with you before production — so what you approve is exactly what you get.",
  },
  {
    q: "Can I request my own design or logo?",
    a: "Yes! We accept custom designs, including logos, handwriting, and special requests. If you're unsure, we'll help refine your idea and make it engraving-ready.",
  },
  {
    q: "How long does it take to complete my order?",
    a: "Standard orders take 2–4 days, and custom or bulk orders take 3–7 days. We'll always let you know early if anything affects the timeline, especially during peak seasons.",
  },
  {
    q: "Do you accept rush orders?",
    a: "Often, yes — it depends on our current queue. Message us before placing your order and we'll confirm whether we can meet your deadline.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Checkout uses a secure PayMongo QR Ph code for the item total. Delivery fees are confirmed separately based on your location.",
  },
  {
    q: "How do I get my plaque, and how much is delivery?",
    a: "After you submit your order, we'll confirm the delivery option and cost with you directly. We ship by courier nationwide, and local pickup or meet-up around Maniki, Kapalong, and Davao del Norte is also available. Delivery fees depend on your location and courier.",
  },
  {
    q: "What if the engraving isn't right?",
    a: "We confirm your photo and text with you before production to avoid mistakes. If a finished piece arrives damaged or doesn't match what we approved together, just message us a photo and we'll make it right with a repair or remake.",
  },
];

function FaqItem({
  item,
  open,
  onToggle,
  id,
}: {
  item: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
  id: number;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = `faq-panel-${id}`;
  const buttonId = `faq-button-${id}`;

  return (
    <div
      className={`overflow-hidden rounded-[22px] border bg-brand-surface shadow-craft transition-colors duration-300 ${
        open ? "border-brand-gold/40" : "border-brand-primary/12"
      }`}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold text-brand-text transition-colors hover:text-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold sm:px-6"
        >
          {item.q}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              open ? "rotate-45 bg-brand-gold text-white" : "bg-brand-cream text-brand-gold"
            }`}
            aria-hidden
          >
            <Plus className="size-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 leading-relaxed text-brand-muted sm:px-6">{item.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" aria-labelledby="faq-heading" className="py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Ornament className="mb-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Good to know
        </p>
        <h2
          id="faq-heading"
          className="mt-4 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          Questions, answered
        </h2>
        <p className="mt-4 text-lg text-brand-muted">
          Straight talk so you can order with confidence.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map((item, i) => (
          <Reveal key={item.q} index={i}>
            <FaqItem
              item={item}
              id={i}
              open={openIndex === i}
              onToggle={() => setOpenIndex((current) => (current === i ? null : i))}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
