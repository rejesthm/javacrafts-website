"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem, SavedCheckoutLead, SavedLeadInfo } from "@/lib/order";
import { isValidEmail } from "@/lib/order";
import {
  CHECKOUT_LEAD_STORAGE_KEY,
  LEAD_STORAGE_KEY,
  clearStoredCart,
  clearStoredCheckoutData,
  readStoredCart,
  saveStoredCart,
  storageAvailable,
} from "@/lib/checkout-storage";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  clearCheckoutData: () => void;
  loadSavedLeadInfo: () => SavedLeadInfo | null;
  saveLeadInfo: (info: SavedLeadInfo) => void;
  clearSavedLeadInfo: () => void;
  loadSavedCheckoutLead: () => SavedCheckoutLead | null;
  saveCheckoutLead: (lead: SavedCheckoutLead) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const storage = storageAvailable();
      setItems(storage ? readStoredCart(storage) : []);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const storage = storageAvailable();
    if (!storage) return;
    try {
      saveStoredCart(storage, items);
    } catch {
      // Storage quota exceeded (e.g. very large photos) — keep the in-memory
      // cart working instead of crashing; it just won't survive a refresh.
      console.warn(
        "[cart] Could not persist cart to localStorage (storage full).",
      );
    }
  }, [items, ready]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => [...current, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    const storage = storageAvailable();
    if (storage) {
      clearStoredCart(storage);
    }
  }, []);

  const clearCheckoutData = useCallback(() => {
    setItems([]);
    const storage = storageAvailable();
    if (storage) {
      clearStoredCheckoutData(storage);
    }
  }, []);

  const loadSavedLeadInfo = useCallback(() => {
    const storage = storageAvailable();
    if (!storage) return null;
    try {
      const raw = storage.getItem(LEAD_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedLeadInfo) : null;
    } catch {
      return null;
    }
  }, []);

  const saveLeadInfo = useCallback((info: SavedLeadInfo) => {
    const storage = storageAvailable();
    if (!storage) return;
    storage.setItem(LEAD_STORAGE_KEY, JSON.stringify(info));
  }, []);

  const clearSavedLeadInfo = useCallback(() => {
    const storage = storageAvailable();
    if (!storage) return;
    storage.removeItem(LEAD_STORAGE_KEY);
  }, []);

  // Returns a saved name/email only when both are present and the email looks
  // valid. Prefers the dedicated checkout-lead key, but falls back to a fully
  // saved address so returning customers also skip the gate.
  const loadSavedCheckoutLead = useCallback((): SavedCheckoutLead | null => {
    const storage = storageAvailable();
    if (!storage) return null;
    const fromRaw = (raw: string | null): SavedCheckoutLead | null => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as Partial<SavedCheckoutLead>;
        const name = (parsed.name ?? "").trim();
        const email = (parsed.email ?? "").trim();
        if (name && isValidEmail(email)) return { name, email };
      } catch {
        // ignore malformed entries
      }
      return null;
    };
    try {
      return (
        fromRaw(storage.getItem(CHECKOUT_LEAD_STORAGE_KEY)) ??
        fromRaw(storage.getItem(LEAD_STORAGE_KEY))
      );
    } catch {
      return null;
    }
  }, []);

  const saveCheckoutLead = useCallback((lead: SavedCheckoutLead) => {
    const storage = storageAvailable();
    if (!storage) return;
    try {
      storage.setItem(
        CHECKOUT_LEAD_STORAGE_KEY,
        JSON.stringify({ name: lead.name.trim(), email: lead.email.trim() }),
      );
    } catch {
      console.warn("[cart] Could not persist checkout lead to localStorage.");
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, item) => sum + item.price, 0),
      ready,
      addItem,
      removeItem,
      clearCart,
      clearCheckoutData,
      loadSavedLeadInfo,
      saveLeadInfo,
      clearSavedLeadInfo,
      loadSavedCheckoutLead,
      saveCheckoutLead,
    }),
    [
      addItem,
      clearCart,
      clearCheckoutData,
      clearSavedLeadInfo,
      items,
      loadSavedCheckoutLead,
      loadSavedLeadInfo,
      ready,
      removeItem,
      saveCheckoutLead,
      saveLeadInfo,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
