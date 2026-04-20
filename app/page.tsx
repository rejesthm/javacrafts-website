import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Benefits } from "@/components/sections/benefits";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Offer } from "@/components/sections/offer";
import { SocialProof } from "@/components/sections/social-proof";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[30px] focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <Benefits />
        <HowItWorks />
        <SocialProof />
        <Offer />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
