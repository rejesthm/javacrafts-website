import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Occasions } from "@/components/sections/occasions";
import { ProductPersonalization } from "@/components/sections/product-personalization";
import { SocialProof } from "@/components/sections/social-proof";
import { StatsBand } from "@/components/sections/stats-band";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <StatsBand />
        <Occasions />
        <ProductPersonalization />
        <SocialProof />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
