"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EthicalHero, type HangingProductItem } from "@/components/ui/hero-5";
import { LOCATION } from "@/lib/site";

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

export function Hero() {
  return (
    <div className="w-full bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,#faf7f2_0%,#f4ede3_45%,#f2ebe1_78%,#ebe2d6_100%)]">
      <EthicalHero
        title={
          <span className="text-balance">
            Turn a photo into a{" "}
            <span className="text-primary">keepsake</span> they&apos;ll keep
            forever.
          </span>
        }
        subtitle={`Custom laser-engraved wood plaques for birthdays, anniversaries, graduations, and memorials — handcrafted to order in ${LOCATION}.`}
        cta={
          <Button
            size="lg"
            asChild
            className="rounded-full bg-brand-primary px-8 text-white hover:bg-brand-secondary"
          >
            <a href="#personalize">
              Personalize yours
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </a>
          </Button>
        }
        hangingItems={HERO_SHOWCASE}
      />
    </div>
  );
}
