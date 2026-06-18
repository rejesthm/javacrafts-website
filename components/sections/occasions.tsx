import { Cake, GraduationCap, Heart, HeartHandshake, Gift, Sprout } from "lucide-react";

import { Ornament } from "@/components/ui/ornament";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

const occasions = [
  {
    icon: Cake,
    title: "Birthdays",
    body: "A gift that says you remembered every little detail about them.",
  },
  {
    icon: Heart,
    title: "Anniversaries",
    body: "Your story, your date, your photo — etched to last as long as the love.",
  },
  {
    icon: GraduationCap,
    title: "Graduations",
    body: "Celebrate the milestone with a keepsake that outlives the diploma.",
  },
  {
    icon: Sprout,
    title: "Remembrance",
    body: "A gentle, lasting tribute to someone whose memory you hold close.",
  },
  {
    icon: HeartHandshake,
    title: "Appreciation",
    body: "Say thank you to mentors, parents, and teams in a way they'll keep.",
  },
  {
    icon: Gift,
    title: "Souvenirs & favors",
    body: "Personalized keepsakes for weddings, reunions, and special events.",
  },
];

export function Occasions() {
  return (
    <Section id="occasions" aria-labelledby="occasions-heading" className="py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Ornament className="mb-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Made for the moments that matter
        </p>
        <h2
          id="occasions-heading"
          className="mt-4 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          A gift for every meaningful occasion
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-brand-muted">
          Whatever the moment, we&apos;ll help you turn it into something they can hold.
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {occasions.map((item, i) => (
          <Reveal as="li" key={item.title} index={i}>
            <div className="card-accent-top group flex h-full items-start gap-4 rounded-[24px] border border-brand-primary/12 bg-brand-surface p-6 shadow-craft transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/35 hover:shadow-craft-lg">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20 transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white"
                aria-hidden
              >
                <item.icon className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-serif text-xl font-semibold text-brand-text">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                  {item.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
