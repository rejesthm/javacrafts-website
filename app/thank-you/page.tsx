import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CreditCard, MessageSquare, PackageCheck } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Section } from "@/components/ui/section";
import { BRAND_NAME, getPrimaryContact } from "@/lib/site";

export const metadata: Metadata = {
  title: `Thank you — ${BRAND_NAME}`,
  description: "We received your order and payment confirmation.",
};

const steps = [
  {
    icon: MessageSquare,
    title: "We reach out to confirm",
    body: "We'll message you on your email or Messenger to confirm your photo, wording, and the final design proof.",
  },
  {
    icon: CreditCard,
    title: "Payment is received",
    body: "Your QR payment is confirmed. We'll only settle delivery or pickup details with you from here.",
  },
  {
    icon: PackageCheck,
    title: "We craft & send it your way",
    body: "Once you approve, we carefully engrave your keepsake and coordinate getting it to you.",
  },
];

export default function ThankYouPage() {
  const contact = getPrimaryContact();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Section className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-20 w-20 animate-success-pop items-center justify-center rounded-full bg-green-100 text-green-600 ring-8 ring-green-50">
              <CheckCircle2 className="size-10" aria-hidden />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
              Order payment received
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-brand-text">
              You&apos;re all set — thank you!
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              We&apos;ve received your request and we&apos;re excited to make something
              meaningful for you. Your item payment is confirmed, and here&apos;s what
              happens next.
            </p>
          </div>

          <ol className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="relative flex h-full flex-col rounded-[24px] border border-brand-primary/12 bg-brand-surface p-6 shadow-craft"
              >
                <span className="absolute right-5 top-5 font-serif text-3xl font-bold text-brand-gold/25">
                  {i + 1}
                </span>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20"
                  aria-hidden
                >
                  <step.icon className="size-6" strokeWidth={1.75} />
                </span>
                <h2 className="mt-4 font-serif text-lg font-semibold text-brand-text">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 text-center">
            <p className="text-sm text-brand-muted">
              Keep an eye on your inbox and Messenger — we usually reply within a day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-8 text-base font-semibold text-brand-bg shadow-craft transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              >
                Back to home
              </Link>
              {contact ? (
                <a
                  href={contact.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-surface px-8 text-base font-semibold text-brand-text shadow-craft transition hover:bg-brand-cream hover:text-brand-gold"
                >
                  {contact.label}
                </a>
              ) : null}
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
