import { Section } from "@/components/ui/section";

const faqs = [
  {
    q: "How does the customization process work?",
    a: "Once you place your order, you can provide the name, date, or message you want engraved. For custom designs, you can upload your file or describe your idea. We’ll confirm the details before production to make sure everything is correct.",
  },
  {
    q: "Can I request my own design or logo?",
    a: "Yes! We accept custom designs, including logos, handwriting, and special requests. If you're unsure, we can also help refine your idea to make it engraving-ready.",
  },
  {
    q: "How long does it take to complete my order?",
    a: "Standard orders: 2–4 days. Custom/bulk orders: 3–7 days. We’ll always inform you if there are any delays, especially during peak seasons.",
  },
  {
    q: "Do you accept rush orders?",
    a: "We do, depending on availability. Message us first before placing your order so we can confirm if we can meet your deadline.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept GCash and bank transfer.",
  },
];

export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-heading" className="pb-20 pt-6">
      <h2
        id="faq-heading"
        className="text-center font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
      >
        Questions, answered
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-brand-muted">
        Straight talk so you can order with confidence.
      </p>
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="rounded-[30px] border border-brand-primary/20 bg-brand-surface px-5 py-4 open:shadow-sm"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold text-brand-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span
                  className="faq-marker inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xl font-light text-brand-primary transition-transform duration-200"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-brand-muted leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
