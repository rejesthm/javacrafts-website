import Image from "next/image";
import { Heart, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

const reasons = [
  {
    icon: Sparkles,
    title: "Personalized engraving",
    body: "Every line is laser-cut with intention and finished with care. The wood grain, the finish, the detail: all chosen to feel premium in hand.",
  },
  {
    icon: MessageCircle,
    title: "Friendly, human updates",
    body: "We confirm your photo and wording before anything is engraved, so there are no “oops” moments — just a piece that comes out exactly right.",
  },
  {
    icon: ShieldCheck,
    title: "Made-right guarantee",
    body: "If a finished piece arrives damaged or doesn't match what we approved together, message us a photo and we'll repair or remake it.",
  },
  {
    icon: Heart,
    title: "Built for real budgets",
    body: "Students, young pros, and couples — gift something that feels meaningful and premium without the stiff price tag.",
  },
];

export function Benefits() {
  return (
    <Section id="why" aria-labelledby="benefits-heading" className="py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <div className="relative">
            <div className="texture-grain relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-craft-lg">
              <Image
                src="/products/plaque-custom.png"
                alt="Custom laser-engraved wooden plaque with portrait and name on display"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/45 via-transparent to-transparent" aria-hidden />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-brand-gold/25 bg-brand-surface/95 px-5 py-4 shadow-craft backdrop-blur sm:left-8 sm:right-auto sm:max-w-xs">
              <p className="font-serif text-lg font-semibold text-brand-text">
                “It looked like the photo — but better in person.”
              </p>
              <p className="mt-1 text-sm text-brand-muted">— A real JAVA CRAFTS customer</p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
              Why choose us
            </p>
            <h2
              id="benefits-heading"
              className="mt-4 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
            >
              Gifts that feel thoughtful — not rushed, not generic
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              We treat your moment like it&apos;s our own, from the first message to the
              finished keepsake.
            </p>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {reasons.map((reason, i) => (
              <Reveal as="li" key={reason.title} index={i}>
                <div className="flex h-full flex-col rounded-[22px] border border-brand-primary/12 bg-brand-surface p-5 shadow-craft transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-craft-lg">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20"
                    aria-hidden
                  >
                    <reason.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-brand-text">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {reason.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
