import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ProductPersonalization } from "@/components/sections/product-personalization";
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
        <ProductPersonalization />
        <SocialProof />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
