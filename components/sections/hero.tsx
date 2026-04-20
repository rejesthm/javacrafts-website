import Image from "next/image";
import Link from "next/link";
import { OrderModalTrigger } from "@/components/order-modal-provider";
import { Section } from "@/components/ui/section";
import { AUDIENCE, LOCATION, OFFER } from "@/lib/site";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1920&q=80";

export function Hero() {
  return (
    <Section className="pb-12 pt-8 sm:pb-16 sm:pt-10">
      <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-[30px]">
        <Image
          src={HERO_IMAGE}
          alt="Wooden workbench with craft tools"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1280px) 100vw, 1152px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25"
          aria-hidden
        />
        <div className="relative flex min-h-[min(70vh,560px)] flex-col justify-end px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <p className="mb-4 inline-flex w-fit rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            25% OFF on all items — limited-time welcome treat
          </p>
          <h1 className="font-serif text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {OFFER}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
            Built for {AUDIENCE}. Serving {LOCATION}.
          </p>
          <p className="mt-4 text-lg font-medium text-white">
            Personalized Engraved Gifts That Last a Lifetime
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <OrderModalTrigger className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-brand-primary shadow-md transition hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Order now
            </OrderModalTrigger>
            <Link
              href="#about"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white/70 bg-transparent px-6 text-base font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
