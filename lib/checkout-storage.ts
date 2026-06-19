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
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(
  storage: Pick<Storage, "removeItem" | "setItem">,
  items: CartItem[],
) {
  if (items.length === 0) {
    storage.removeItem(CART_STORAGE_KEY);
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
