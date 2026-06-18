"use client";

import { ArrowRight, Hammer, Star, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EthicalHero, type HangingProductItem } from "@/components/ui/hero-5";
import { Ornament } from "@/components/ui/ornament";

const HERO_SHOWCASE: HangingProductItem[] = [
  {
    id: "custom",
    title: "Custom",
    imageUrl: "/products/plaque-custom.png",
    alt: "Laser-engraved wooden plaque with portrait and personalized name",
    href: "#personalize",
  },
  {
    id: "portrait",
    title: "Portrait",
    imageUrl: "/products/plaque-portrait.png",
    alt: "Wooden plaque with detailed engraved portrait on a stand",
    href: "#personalize",
  },
  {
    id: "family",
    title: "Family",
    imageUrl: "/products/plaque-family.png",
    alt: "Family portrait engraved on a light wood plaque",
    href: "#personalize",
  },
  {
    id: "appreciation",
    title: "Appreciation",
    imageUrl: "/products/plaque-appreciation.png",
    alt: "Custom appreciation plaque with photo and ceremony details",
    href: "#personalize",
  },
  {
    id: "commemorative",
    title: "Commemorative",
    imageUrl: "/products/plaque-commemorative.png",
    alt: "Commemorative wooden plaque with engraved portrait and dedication",
    href: "#personalize",
  },
];

const TRUST = [
  { icon: Star, label: "Loved by 200+ gift-givers" },
  { icon: Hammer, label: "Personalized engraving to order" },
  { icon: Truck, label: "Nationwide delivery + local pickup" },
];

export function Hero() {
  return (
    <div className="hero-canvas relative isolate w-full overflow-x-clip">
      {/* Warm glow + amber spotlight accents */}
      <div
        className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-8 -z-10 h-72 w-72 rounded-full bg-brand-gold-soft/20 blur-3xl"
        aria-hidden
      />
      {/* Fine film grain for tactile engraved depth */}
      <div
        className="hero-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-soft-light"
        aria-hidden
      />
      {/* Smooth fade into the page background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-brand-bg"
        aria-hidden
      />
      <EthicalHero
        eyebrow={
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-cream/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold shadow-craft backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-gold" aria-hidden />
            Personalized engraved, just for you
          </span>
        }
        title={
          <span className="text-balance">
            Turn a photo into a keepsake{" "}
            <span className="text-brand-gold">they&apos;ll treasure forever</span>.
          </span>
        }
        subtitle={`Custom laser-engraved wood plaques, portraits, and keepsakes for birthdays, anniversaries, graduations, and remembrance — each one personalized for your moment.`}
        cta={
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="cta-sheen min-h-12 rounded-full bg-brand-primary px-8 text-brand-bg shadow-craft transition hover:bg-brand-secondary hover:shadow-craft-lg"
            >
              <a href="#personalize">
                Personalize yours
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-h-12 rounded-full border-brand-primary/20 bg-brand-surface px-8 text-brand-text shadow-craft transition hover:border-brand-gold/50 hover:text-brand-gold"
            >
              <a href="#gallery">Read reviews</a>
            </Button>
          </div>
        }
        trust={
          <div>
            <Ornament className="mb-6" />
            <ul className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-brand-muted">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-brand-gold" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        }
        hangingItems={HERO_SHOWCASE}
      />
    </div>
  );
}
