import Link from "next/link";
import { Sparkles } from "lucide-react";

import {
  BRAND_NAME,
  LOCATION,
  SOCIALS,
  getPrimaryContact,
  type SocialIcon,
} from "@/lib/site";

const nav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Personalize", href: "/#personalize" },
  { label: "Reviews", href: "/#gallery" },
  { label: "FAQ", href: "/#faq" },
] as const;

const SOCIAL_ICON_PATHS: Record<SocialIcon, string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  tiktok:
    "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
};

export function SiteFooter() {
  const socials = SOCIALS.filter((s) => s.href);
  const contact = getPrimaryContact();
  return (
    <footer className="relative mt-4 overflow-hidden bg-brand-primary text-brand-bg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-brand-bg"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold-soft ring-1 ring-brand-gold/30"
                aria-hidden
              >
                <Sparkles className="size-4" />
              </span>
              {BRAND_NAME}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-bg/70">
              Personalized engraved gifts for meaningful moments — handcrafted with care in{" "}
              {LOCATION}.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-soft">
              Explore
            </p>
            <ul className="mt-4 space-y-3 text-sm text-brand-bg/85">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-brand-gold-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-soft">
              Help
            </p>
            <ul className="mt-4 space-y-3 text-sm text-brand-bg/85">
              <li>
                <Link href="/#personalize" className="transition hover:text-brand-gold-soft">
                  Start an order
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition hover:text-brand-gold-soft">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition hover:text-brand-gold-soft">
                  Your cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-soft">
              Let&apos;s talk
            </p>
            {contact ? (
              <a
                href={contact.href}
                className="cta-sheen mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-gold px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-craft transition hover:bg-brand-gold-soft hover:text-brand-primary"
              >
                {contact.label}
              </a>
            ) : (
              <Link
                href="/#personalize"
                className="cta-sheen mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-gold px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-craft transition hover:bg-brand-gold-soft hover:text-brand-primary"
              >
                Get in touch
              </Link>
            )}
            {socials.length > 0 ? (
              <div className="mt-5 flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-bg/10 text-brand-bg ring-1 ring-brand-bg/15 transition hover:bg-brand-gold hover:text-white"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={SOCIAL_ICON_PATHS[social.icon]} />
                    </svg>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-12 border-t border-brand-bg/10 pt-8 text-center text-sm text-brand-bg/60">
          © {new Date().getFullYear()} {BRAND_NAME}. Handmade with care in {LOCATION}.
        </p>
      </div>
    </footer>
  );
}
