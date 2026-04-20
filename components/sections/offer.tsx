import { OrderModalTrigger } from "@/components/order-modal-provider";
import { Section } from "@/components/ui/section";

const included = [
  "25% OFF on all items (welcome treat—ask for details when you order)",
  "Personalization support: text, dates, handwriting-style requests, and more",
  "Confirmation before production so details are correct",
  "Turnaround guidance: standard orders typically 2–4 days; custom/bulk often 3–7 days",
];

const bonuses = [
  "A simple customization checklist so you don’t miss a detail",
  "Clear updates while your piece is being made",
];

export function Offer() {
  return (
    <Section id="menu" aria-labelledby="offer-heading" className="py-14">
      <div className="rounded-[30px] border-2 border-brand-primary/25 bg-gradient-to-br from-brand-surface to-brand-bg p-8 shadow-md sm:p-10">
        <h2
          id="offer-heading"
          className="font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl"
        >
          What you get when you order with JAVA CRAFTS
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-brand-muted">
          A thoughtful engraved gift—crafted with energy, clarity, and care.
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Included</h3>
            <ul className="mt-4 space-y-3 text-brand-muted">
              {included.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Bonuses</h3>
            <ul className="mt-4 space-y-3 text-brand-muted">
              {bonuses.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-[30px] bg-brand-primary/10 p-5">
              <h3 className="font-semibold text-brand-text">Pricing</h3>
              <p className="mt-2 text-brand-muted">
                Every piece is a little different. Send your idea—we’ll confirm the best
                option and total before we start.
              </p>
            </div>
            <div className="mt-6 rounded-[30px] border border-brand-primary/25 p-5">
              <h3 className="font-semibold text-brand-text">Our promise</h3>
              <p className="mt-2 text-brand-muted">
                We want you thrilled. If something isn’t right, reach out—we’ll work with
                you to make it fair.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <OrderModalTrigger className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-full bg-brand-primary px-8 text-base font-semibold text-white shadow-md transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            Order Now
          </OrderModalTrigger>
        </div>
      </div>
    </Section>
  );
}
