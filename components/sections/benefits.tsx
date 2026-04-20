import { Section } from "@/components/ui/section";

const items = [
  {
    title: "Personalized Engraved Gifts That Last a Lifetime",
    body: "Names, dates, quotes, or inside jokes—etched with care so the moment stays with them.",
  },
  {
    title: "Clear, friendly updates from start to finish",
    body: "We confirm your details before production so there are no “oops” moments.",
  },
  {
    title: "Perfect for real life (and real budgets)",
    body: "Students, young pros, and couples—gift something that feels premium without the stiff vibe.",
  },
];

export function Benefits() {
  return (
    <Section aria-labelledby="benefits-heading" className="py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="benefits-heading"
          className="text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl"
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
            className="rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-brand-text">{item.title}</h3>
            <p className="mt-2 text-brand-muted">{item.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12 grid gap-6 rounded-2xl border border-dashed border-brand-primary/35 bg-brand-primary/5 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-muted">
            Before
          </p>
          <p className="mt-2 text-lg text-brand-text">
            Generic gifts that feel last-minute and forgettable.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-primary">
            After
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-text">
            Personalized Engraved Gifts That Last a Lifetime—unique to your story.
          </p>
        </div>
      </div>
    </Section>
  );
}
