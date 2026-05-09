"use client";

import { EthicalHero, type HangingProductItem } from "@/components/ui/hero-5";
import {
  AUDIENCE,
  BRAND_NAME,
  LOCATION,
  OFFER,
} from "@/lib/site";

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
          <>
            Personalized engraved gifts
            <br />
            from <span className="font-serif">{BRAND_NAME}</span>,{" "}
            <span className="text-primary">made for your story.</span>
          </>
        }
        subtitle={`${OFFER} Built for ${AUDIENCE}. Serving ${LOCATION}.`}
        hangingItems={HERO_SHOWCASE}
      />
    </div>
  );
}
