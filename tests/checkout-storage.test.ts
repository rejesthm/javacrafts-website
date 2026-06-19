import assert from "node:assert/strict";
import test from "node:test";

import {
  CART_STORAGE_KEY,
  CHECKOUT_LEAD_STORAGE_KEY,
  LEAD_STORAGE_KEY,
  clearStoredCheckoutData,
  saveStoredCart,
} from "../lib/checkout-storage";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test("clears all checkout-related browser storage after purchase", () => {
  const storage = new MemoryStorage();
  storage.setItem(CART_STORAGE_KEY, "cart");
  storage.setItem(LEAD_STORAGE_KEY, "lead");
  storage.setItem(CHECKOUT_LEAD_STORAGE_KEY, "checkout lead");
  storage.setItem("other-key", "keep me");

  clearStoredCheckoutData(storage);

  assert.equal(storage.getItem(CART_STORAGE_KEY), null);
  assert.equal(storage.getItem(LEAD_STORAGE_KEY), null);
  assert.equal(storage.getItem(CHECKOUT_LEAD_STORAGE_KEY), null);
  assert.equal(storage.getItem("other-key"), "keep me");
});

test("clears checkout-related browser storage when saving an empty cart", () => {
  const storage = new MemoryStorage();
  storage.setItem(CART_STORAGE_KEY, "cart");
  storage.setItem(LEAD_STORAGE_KEY, "lead");
  storage.setItem(CHECKOUT_LEAD_STORAGE_KEY, "checkout lead");
  storage.setItem("other-key", "keep me");

  saveStoredCart(storage, []);

  assert.equal(storage.getItem(CART_STORAGE_KEY), null);
  assert.equal(storage.getItem(LEAD_STORAGE_KEY), null);
  assert.equal(storage.getItem(CHECKOUT_LEAD_STORAGE_KEY), null);
  assert.equal(storage.getItem("other-key"), "keep me");
});
