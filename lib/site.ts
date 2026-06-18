/** Central copy + GHL payload strings — keep in sync with marketing */
export const BRAND_NAME = "JAVA CRAFTS";
export const OFFER =
  "We create personalized engraved gifts for meaningful moments.";
export const LOCATION = "Maniki, Kapalong, Davao del Norte";
export const AUDIENCE = "Students, young professionals, and couples";
export const GHL_SOURCE = "nextjs-funnel";
export const GHL_PAGE_SLUG_HOME = "home";
export const BUSINESS_CATEGORY = "Arts & Crafts & Handmade";
export const GOAL_TAG = "Sales & Conversions";

export type SocialIcon = "instagram" | "tiktok" | "facebook";
export type SocialLink = { label: string; href: string; icon: SocialIcon };

/**
 * Real social profiles. Leave `href` empty to hide that icon — we never ship
 * dead "#" links. Fill these with your actual profile URLs.
 */
export const SOCIALS: SocialLink[] = [
  { label: "Instagram", href: "", icon: "instagram" },
  { label: "TikTok", href: "", icon: "tiktok" },
];

/**
 * Primary contact channel for "Get in touch" and the checkout error fallback.
 * Fill at least one. Resolution priority: messenger → phone → email.
 */
export const CONTACT = {
  messenger: "", // e.g. https://m.me/yourpage
  phone: "", // e.g. +639XXXXXXXXX
  email: "", // e.g. hello@javacrafts.ph
};

/** First available contact channel, or null if none is configured yet. */
export function getPrimaryContact(): { href: string; label: string } | null {
  if (CONTACT.messenger) return { href: CONTACT.messenger, label: "Message us" };
  if (CONTACT.phone) return { href: `tel:${CONTACT.phone}`, label: "Call us" };
  if (CONTACT.email) return { href: `mailto:${CONTACT.email}`, label: "Email us" };
  return null;
}