"use client";

import { useCart } from "@/components/cart-provider";

export function CartBadge() {
  const { count, ready } = useCart();

  if (!ready || count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-success-pop items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold leading-none text-white shadow-craft ring-2 ring-brand-bg">
      {count}
    </span>
  );
}
