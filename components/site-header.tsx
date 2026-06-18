import Link from "next/link";
import { Clock, ShoppingCart, Sparkles } from "lucide-react";

import { CartBadge } from "@/components/cart-badge";
import { HeaderCountdown } from "@/components/header-countdown";
import { BRAND_NAME } from "@/lib/site";

const nav = [
  { label: "Gift ideas", href: "/#occasions" },
  { label: "Personalize", href: "/#personalize" },
  { label: "Reviews", href: "/#gallery" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-primary/10 bg-brand-bg/85 backdrop-blur-md">
      {/* Welcome-offer countdown bar */}
      <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-bg sm:text-xs">
        <Clock className="size-3.5 shrink-0 text-brand-gold-soft sm:size-4" aria-hidden />
        <span className="hidden sm:inline">Welcome offer ends in</span>
        <span className="sm:hidden">Offer ends in</span>
        <HeaderCountdown />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-brand-text transition hover:opacity-90"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-brand-gold-soft shadow-craft"
              aria-hidden
            >
              <Sparkles className="size-4" />
            </span>
            <span className="leading-none">
              {BRAND_NAME}
              <span className="mt-0.5 hidden text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-brand-muted sm:block">
                Personalized engraved gifts
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text lg:flex"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-1 transition-colors hover:text-brand-gold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/#personalize"
              className="cta-sheen hidden min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-xs font-semibold text-brand-bg shadow-craft transition hover:bg-brand-secondary sm:inline-flex"
            >
              Personalize yours
            </Link>
            <Link
              href="/checkout"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/15 bg-brand-surface text-brand-text shadow-craft transition hover:border-brand-gold/50 hover:text-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
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
