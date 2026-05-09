import Image from "next/image";
import { Section } from "@/components/ui/section";

const items = [
  {
    title: "Personalized Engraved Gifts That Last a Lifetime",
    body: "Names, dates, quotes, or inside jokes—etched with care so the moment stays with them.",
    variant: "dark" as const,
    image: "/products/plaque-appreciation.png",
    imageAlt:
      "Custom wooden appreciation plaque with engraved text and photo on a wooden stand",
  },
  {
    title: "Clear, friendly updates from start to finish",
    body: "We confirm your details before production so there are no “oops” moments.",
    variant: "light" as const,
    image: "/products/plaque-family.png",
    imageAlt: "Family portrait laser-engraved on a light wood plaque with decorative details",
  },
  {
    title: "Perfect for real life (and real budgets)",
    body: "Students, young pros, and couples—gift something that feels premium without the stiff vibe.",
    variant: "dark" as const,
    image: "/products/plaque-portrait.png",
    imageAlt: "Personalized wooden plaque with a detailed engraved portrait on a mini easel",
  },
];

const STRIP_IMAGE = "/products/plaque-custom.png";
const STRIP_IMAGE_ALT =
  "Custom laser-engraved wooden plaque with portrait and name on display";

export function Benefits() {
  return (
    <Section id="benefits" aria-labelledby="benefits-heading" className="py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="benefits-heading"
          className="font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          Why people choose JAVA CRAFTS
        </h2>
        <p className="mt-3 text-lg text-brand-muted">
          Outcomes that feel thoughtful—not rushed, not generic.
        </p>
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.title}
            className={`relative flex min-h-[280px] flex-col overflow-hidden rounded-[30px] shadow-sm ${
              item.variant === "dark"
                ? "bg-brand-primary text-white"
                : "border border-brand-primary/15 bg-brand-surface text-brand-text"
            }`}
          >
            <div className="relative h-40 shrink-0 sm:h-44">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div
                className={`absolute inset-0 ${
                  item.variant === "dark" ? "bg-brand-primary/35" : "bg-black/15"
                }`}
                aria-hidden
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3
                className={`text-lg font-semibold leading-snug ${
                  item.variant === "dark" ? "text-white" : "font-serif text-brand-text"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  item.variant === "dark" ? "text-white/85" : "text-brand-muted"
                }`}
              >
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[240px] overflow-hidden rounded-[30px] shadow-sm lg:min-h-[320px]">
          <Image
            src={STRIP_IMAGE}
            alt={STRIP_IMAGE_ALT}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" aria-hidden />
        </div>
        <div className="space-y-6 px-1">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-brand-text">
              Artisan detail
            </h3>
            <p className="mt-2 text-brand-muted">
              Every line is cut with intention—whether it&apos;s a name, a date, or a tiny symbol
              that only you two understand.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-brand-text">
              Best quality
            </h3>
            <p className="mt-2 text-brand-muted">
              We choose materials and finishes that feel good in hand and age gracefully, so your
              gift keeps telling the story.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 rounded-[30px] border border-dashed border-brand-primary/25 bg-brand-surface p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
            Before
          </p>
          <p className="mt-2 text-lg text-brand-text">
            Generic gifts that feel last-minute and forgettable.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            After
          </p>
          <p className="mt-2 text-lg font-medium text-brand-text">
            Personalized Engraved Gifts That Last a Lifetime—unique to your story.
          </p>
        </div>
      </div>
    </Section>
  );
}