import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Thank you — ${BRAND_NAME}`,
  description: "We received your order request and will follow up shortly.",
};

export default function ThankYouPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-4 py-20"
      >
        <div className="max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
            {BRAND_NAME}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-brand-text">
            You&apos;re all set
          </h1>
          <p className="mt-4 text-lg text-brand-muted">
            We will follow up shortly. Check your inbox for next steps.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-8 text-base font-semibold text-white shadow-md transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}