import Link from "next/link";
import { ArrowLeft, Coffee, LogOut } from "lucide-react";

import { logoutAdminAction } from "@/app/admin/actions";
import { AdminNavLinks } from "@/components/admin-nav-links";
import type { AdminSession } from "@/lib/admin-session";

export function AdminShell({
  session,
  title,
  children,
  action,
}: {
  session: AdminSession;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 min-h-screen bg-brand-primary fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/20 text-brand-gold flex-shrink-0">
              <Coffee className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[15px] font-semibold text-white leading-tight truncate">
                Java Crafts
              </p>
              <p className="text-[11px] text-white/40 leading-tight">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <AdminNavLinks />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 px-4 py-4 space-y-1">
          <p className="px-3 text-xs text-white/35 truncate">{session.email}</p>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/45 hover:text-white/75 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="size-3.5 flex-shrink-0" aria-hidden />
            Back to site
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/45 hover:text-red-400 hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <LogOut className="size-3.5 flex-shrink-0" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 lg:pl-60 min-h-screen bg-[#f8f6f3]">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-[#e5ded5] px-6 py-4 lg:px-8 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-brand-text truncate">{title}</h1>
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </header>

        {/* Page content */}
        <main id="main-content" className="px-6 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
