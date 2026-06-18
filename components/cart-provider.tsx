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

import type { CartItem, SavedLeadInfo } from "@/lib/order";

const CART_STORAGE_KEY = "java-crafts-cart";
const LEAD_STORAGE_KEY = "java-crafts-lead-info";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  loadSavedLeadInfo: () => SavedLeadInfo | null;
  saveLeadInfo: (info: SavedLeadInfo) => void;
  clearSavedLeadInfo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setItems(readCart());
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
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
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const loadSavedLeadInfo = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(LEAD_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedLeadInfo) : null;
    } catch {
      return null;
    }
  }, []);

  const saveLeadInfo = useCallback((info: SavedLeadInfo) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(info));
  }, []);

  const clearSavedLeadInfo = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(LEAD_STORAGE_KEY);
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
      loadSavedLeadInfo,
      saveLeadInfo,
      clearSavedLeadInfo,
    }),
    [
      addItem,
      clearCart,
      clearSavedLeadInfo,
      items,
      loadSavedLeadInfo,
      ready,
      removeItem,
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
