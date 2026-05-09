import Link from "next/link";
import { Clock, ShoppingCart } from "lucide-react";

import { CartBadge } from "@/components/cart-badge";
import { HeaderCountdown } from "@/components/header-countdown";
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
      <div className="flex items-center justify-center gap-2 bg-brand-primary px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-xs">
        <Clock className="size-3.5 shrink-0 opacity-90 sm:size-4" aria-hidden />
        <span className="hidden sm:inline">Welcome offer ends in</span>
        <span className="sm:hidden">Ends in</span>
        <HeaderCountdown />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-3">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <Link
              href="/"
              className="font-serif text-xl font-semibold tracking-tight text-brand-text transition hover:opacity-80"
            >
              {BRAND_NAME}
            </Link>
            <Link
              href="/checkout"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary lg:hidden"
              aria-label="View cart"
            >
              <ShoppingCart className="size-5" aria-hidden />
              <CartBadge />
            </Link>
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
          <div className="hidden items-center justify-end gap-3 lg:flex">
            <Link
              href="/checkout"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-surface text-brand-text shadow-sm transition hover:border-brand-primary/40 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              aria-label="View cart"
            >
              <ShoppingCart className="size-5" aria-hidden />
              <CartBadge />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
