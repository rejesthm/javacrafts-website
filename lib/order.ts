import {
  DEFAULT_PRODUCT,
  type EngravingProduct,
  type EngravingStyleOption,
  type ProductSizeOption,
} from "@/lib/catalog";

export type ProductSizeId = string;

export type CartPhoto = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  sizeId: ProductSizeId;
  sizeLabel: string;
  dimensions: string;
  sizePrice: number;
  styleId: string;
  styleName: string;
  stylePriceAdjustment: number;
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
  fulfillmentType?: "delivery" | "pickup";
  houseStreet: string;
  barangay: string;
  barangayCode?: string;
  postalCode: string;
  city: string;
  cityCode?: string;
  province: string;
  provinceCode?: string;
  region: string;
  regionCode?: string;
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
  ...DEFAULT_PRODUCT.sizes,
];

export const PRODUCT_STYLES: EngravingStyleOption[] = [
  ...DEFAULT_PRODUCT.styles,
];

export function createDefaultProduct(): EngravingProduct {
  return structuredClone(DEFAULT_PRODUCT);
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function formatPeso(amount: number) {
  return `P${amount.toLocaleString("en-PH")}`;
}
