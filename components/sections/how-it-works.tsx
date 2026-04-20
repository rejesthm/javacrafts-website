import { Section } from "@/components/ui/section";

const steps = [
  {
    n: "1",
    title: "Tap Order Now & tell us what you need",
    body: "Share the name, date, or message you want engraved—or describe a custom idea.",
  },
  {
    n: "2",
    title: "Send details or upload your file",
    body: "For logos or custom art, upload your file or describe it—we’ll help make it engraving-ready.",
  },
  {
    n: "3",
    title: "We confirm before we produce",
    body: "We review everything with you so spelling, layout, and vibe are spot on.",
  },
  {
    n: "4",
    title: "We engrave with precision",
    body: "Clean lines, premium feel, and careful finishing—done locally with care.",
  },
  {
    n: "5",
    title: "Pick up or coordinate delivery",
    body: "We’ll let you know when it’s ready and keep you posted if timing shifts.",
  },
];

export function HowItWorks() {
  return (
    <Section id="about" aria-labelledby="steps-heading" className="py-14">
      <h2
        id="steps-heading"
        className="text-center font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
      >
        How ordering works
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-brand-muted">
        Five simple steps—no guesswork, no stress.
      </p>
      <ol className="mt-12 space-y-6">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-[30px] border border-brand-primary/15 bg-brand-surface p-5 shadow-sm sm:gap-6 sm:p-6"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-brand-primary text-lg font-bold text-white"
              aria-hidden
            >
              {step.n}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-muted">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-brand-text">{step.title}</h3>
              <p className="mt-2 text-brand-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
