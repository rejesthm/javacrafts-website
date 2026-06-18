import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: "200+", label: "Keepsakes crafted" },
  { value: "4.9★", label: "Average rating" },
  { value: "2–4", label: "Day turnaround" },
  { value: "100%", label: "Confirmed before engraving" },
];

export function StatsBand() {
  return (
    <div className="mx-auto -mt-2 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-brand-gold/20 bg-brand-gold/15 shadow-craft sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 bg-brand-surface px-4 py-7 text-center transition-colors duration-300 hover:bg-brand-cream"
            >
              <dt className="font-serif text-3xl font-bold text-brand-gold sm:text-4xl">
                {stat.value}
              </dt>
              <dd className="text-xs font-medium uppercase tracking-[0.12em] text-brand-muted sm:text-sm sm:tracking-[0.08em]">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
