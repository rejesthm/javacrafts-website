"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, MessageSquareHeart, PackageCheck, Settings, Truck } from "lucide-react";

const nav = [
  { href: "/admin", label: "Orders", icon: PackageCheck },
  { href: "/admin/catalog", label: "Catalog", icon: Boxes },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareHeart },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="px-3 space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-gold/20 text-brand-gold border-l-2 border-brand-gold pl-[10px]"
                : "text-white/65 hover:bg-white/8 hover:text-white border-l-2 border-transparent pl-[10px]"
            }`}
          >
            <Icon className="size-4 flex-shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
