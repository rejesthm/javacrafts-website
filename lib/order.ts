export type ProductSizeId = "s" | "m" | "l";

export type ProductSizeOption = {
  id: ProductSizeId;
  label: string;
  dimensions: string;
  price: number;
};

export type CartPhoto = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
};

export type CartItem = {
  id: string;
  productName: string;
  sizeId: ProductSizeId;
  sizeLabel: string;
  dimensions: string;
  price: number;
  customText: string;
  photo: CartPhoto;
  createdAt: string;
};

export type SavedLeadInfo = {
  name: string;
  email: string;
  phone: string;
  messenger: string;
  houseStreet: string;
  barangay: string;
  postalCode: string;
  city: string;
  region: string;
};

/**
 * Minimal lead captured before checkout (name + email only). Stored separately
 * from {@link SavedLeadInfo} so the pre-checkout gate never overwrites a fully
 * saved address, and so we always retain a follow-up contact even if checkout
 * is abandoned.
 */
export type SavedCheckoutLead = {
  name: string;
  email: string;
};

/** Shared email shape — used by both the lead gate and full checkout. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export const PRODUCT_NAME = "Personalized Engraved Plaque";

export const PRODUCT_SIZES: ProductSizeOption[] = [
  { id: "s", label: "S", dimensions: "5x7 inches", price: 400 },
  { id: "m", label: "M", dimensions: "8x6 inches", price: 650 },
  { id: "l", label: "L", dimensions: "10x8 inches", price: 850 },
];

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function formatPeso(amount: number) {
  return `P${amount.toLocaleString("en-PH")}`;
}
