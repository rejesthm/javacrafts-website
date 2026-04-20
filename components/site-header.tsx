import Link from "next/link";
import { BRAND_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-brand-primary/20 bg-brand-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-brand-text transition hover:text-brand-primary"
        >
          {BRAND_NAME}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-3">
          <Link
            href="#order"
            className="inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Order Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
