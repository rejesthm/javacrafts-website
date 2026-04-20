import { Section } from "@/components/ui/section";

const testimonials = [
  {
    quote:
      "I ordered a personalized wooden keychain and I was honestly impressed with the quality. The engraving was precise and the item felt premium. It’s such a simple product but it felt very meaningful.",
    name: "M. Santos",
  },
  {
    quote:
      "Java Crafts exceeded my expectations. I requested a custom design for a birthday gift and they delivered exactly what I had in mind. The communication was smooth and the result was beautiful.",
    name: "J. Tibog",
  },
  {
    quote:
      "I needed a last-minute gift and they still managed to deliver on time. The engraving was clean and professional. Highly recommended if you’re looking for something unique and personal.",
    name: "S. Minor",
  },
];

export function SocialProof() {
  return (
    <Section aria-labelledby="proof-heading" className="py-14">
      <h2
        id="proof-heading"
        className="text-center text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl"
      >
        Loved by people who like gifts with heart
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-brand-muted">
        Real words from real customers—no fluff, no fake metrics.
      </p>
      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t) => (
          <li
            key={t.name}
            className="flex flex-col rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-sm"
          >
            <blockquote className="flex-1 text-brand-text">
              <p className="text-lg leading-relaxed">“{t.quote}”</p>
            </blockquote>
            <footer className="mt-6 border-t border-brand-primary/10 pt-4">
              <cite className="not-italic font-semibold text-brand-secondary">
                — {t.name}
              </cite>
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  );
}
