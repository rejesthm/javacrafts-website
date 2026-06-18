"use client";

import { cn } from "@/lib/utils";
import { Check, ClipboardList, Package, Upload } from "lucide-react";
import type React from "react";

import { Ornament } from "@/components/ui/ornament";
import { Reveal } from "@/components/ui/reveal";

export interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> {
  headingId?: string;
}

interface StepCardProps {
  icon: React.ReactNode;
  stepLabel: string;
  title: string;
  description: string;
  benefits: string[];
}

const StepCard: React.FC<StepCardProps> = ({
  icon,
  stepLabel,
  title,
  description,
  benefits,
}) => (
  <article
    className={cn(
      "group relative flex h-full flex-col overflow-hidden rounded-[28px]",
      "border border-brand-primary/12 bg-brand-surface shadow-craft",
      "transition-all duration-300 ease-out",
      "hover:-translate-y-1.5 hover:border-brand-gold/35 hover:shadow-craft-lg"
    )}
  >
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent"
      aria-hidden
    />
    <div className="flex flex-1 flex-col p-6 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20 transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white"
          aria-hidden
        >
          {icon}
        </div>
        <span className="rounded-full border border-brand-gold/20 bg-brand-cream px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-gold">
          {stepLabel}
        </span>
      </div>
      <h3 className="font-serif text-xl font-semibold leading-snug text-brand-text sm:text-[1.35rem]">
        {title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-brand-muted">{description}</p>
      <ul className="mt-6 space-y-3 border-t border-brand-primary/10 pt-6">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-brand-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export const HowItWorks: React.FC<HowItWorksProps> = ({
  className,
  headingId = "steps-heading",
  ...props
}) => {
  const stepsData = [
    {
      icon: <ClipboardList className="h-7 w-7" strokeWidth={1.75} aria-hidden />,
      stepLabel: "Step 1",
      title: "Share your details",
      description:
        "Tell us the name, date, or message you want engraved—or describe a custom idea.",
      benefits: [
        "Space for occasion and wording notes",
        "Room for special requests or references",
        "We’re here if you’re unsure what to ask for",
      ],
    },
    {
      icon: <Upload className="h-7 w-7" strokeWidth={1.75} aria-hidden />,
      stepLabel: "Step 2",
      title: "Send artwork or references",
      description:
        "For logos or custom art, upload your file or describe it—we’ll help make it engraving-ready.",
      benefits: [
        "Upload logos, sketches, or inspiration",
        "We check layout and contrast before we cut",
        "Proofs so spelling and vibe are right",
      ],
    },
    {
      icon: <Package className="h-7 w-7" strokeWidth={1.75} aria-hidden />,
      stepLabel: "Step 3",
      title: "We craft & you receive",
      description:
        "We confirm with you, engrave with care, then coordinate pickup or delivery when it’s ready.",
      benefits: [
        "Nothing is engraved until you’re happy",
        "Clean lines and careful finishing",
        "Pickup or delivery—we’ll keep you posted",
      ],
    },
  ];

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden bg-background py-16 sm:py-24",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(43,30,22,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
          <Ornament className="mb-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
            The process
          </p>
          <h2
            id={headingId}
            className="mt-4 font-serif text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            How ordering works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-brand-muted">
            From your first message to the finished piece—clear steps, human care, no jargon.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {stepsData.map((step, i) => (
            <Reveal key={step.stepLabel} index={i} className="h-full">
              <StepCard
                icon={step.icon}
                stepLabel={step.stepLabel}
                title={step.title}
                description={step.description}
                benefits={step.benefits}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};