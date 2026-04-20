import Link from "next/link";
import { OrderModalTrigger } from "@/components/order-modal-provider";
import { BRAND_NAME } from "@/lib/site";

const nav = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/#menu" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-brand-primary/10 bg-brand-bg">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-3">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <Link
              href="/"
              className="font-serif text-xl font-semibold tracking-tight text-brand-text transition hover:opacity-80"
            >
              {BRAND_NAME}
            </Link>
            <OrderModalTrigger className="inline-flex min-h-11 min-w-[7rem] items-center justify-center rounded-full bg-brand-primary px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary lg:hidden">
              Contact
            </OrderModalTrigger>
          </div>
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-text"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-brand-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden justify-end lg:flex">
            <OrderModalTrigger className="inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-full bg-brand-primary px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              Contact
            </OrderModalTrigger>
          </div>
        </div>
      </div>
    </header>
  );
}
