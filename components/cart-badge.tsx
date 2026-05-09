"use client";

import { useCart } from "@/components/cart-provider";

export function CartBadge() {
  const { count, ready } = useCart();

  if (!ready || count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold leading-none text-white ring-2 ring-brand-bg">
      {count}
    </span>
  );
}
