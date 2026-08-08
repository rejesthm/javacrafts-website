import { DEFAULT_PRODUCT } from "@/lib/catalog";
import type { CartItem } from "@/lib/order";

export const CART_STORAGE_KEY = "java-crafts-cart";
export const LEAD_STORAGE_KEY = "java-crafts-lead-info";
export const CHECKOUT_LEAD_STORAGE_KEY = "java-crafts-checkout-lead";

type CheckoutStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function readStoredCart(storage: Pick<Storage, "getItem">): CartItem[] {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item))
      : [];
  } catch {
    return [];
  }
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<CartItem>;
  if (!item.id || !item.sizeId || !item.sizeLabel || !item.dimensions || !item.photo) {
    return null;
  }

  const defaultStyle = DEFAULT_PRODUCT.styles[0]!;
  const price = Number(item.price ?? 0);
  const stylePriceAdjustment = Number(item.stylePriceAdjustment ?? 0);

  return {
    id: String(item.id),
    productId: item.productId || DEFAULT_PRODUCT.id,
    productName: item.productName || DEFAULT_PRODUCT.name,
    sizeId: String(item.sizeId),
    sizeLabel: String(item.sizeLabel),
    dimensions: String(item.dimensions),
    sizePrice: Number(item.sizePrice ?? Math.max(0, price - stylePriceAdjustment)),
    styleId: item.styleId || defaultStyle.id,
    styleName: item.styleName || defaultStyle.name,
    stylePriceAdjustment,
    price,
    customText: item.customText || "",
    photo: item.photo,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export function saveStoredCart(
  storage: Pick<Storage, "removeItem" | "setItem">,
  items: CartItem[],
) {
  if (items.length === 0) {
    clearStoredCheckoutData(storage);
    return;
  }
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function clearStoredCart(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(CART_STORAGE_KEY);
}

export function clearStoredCheckoutData(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(CART_STORAGE_KEY);
  storage.removeItem(LEAD_STORAGE_KEY);
  storage.removeItem(CHECKOUT_LEAD_STORAGE_KEY);
}

export function storageAvailable(): CheckoutStorage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
