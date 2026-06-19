import assert from "node:assert/strict";
import test from "node:test";

import { clearStoredCheckoutData } from "../lib/checkout-storage";

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
  storage.setItem("java-crafts-cart", "cart");
  storage.setItem("java-crafts-lead-info", "lead");
  storage.setItem("java-crafts-checkout-lead", "checkout lead");
  storage.setItem("other-key", "keep me");

  clearStoredCheckoutData(storage);

  assert.equal(storage.getItem("java-crafts-cart"), null);
  assert.equal(storage.getItem("java-crafts-lead-info"), null);
  assert.equal(storage.getItem("java-crafts-checkout-lead"), null);
  assert.equal(storage.getItem("other-key"), "keep me");
});
