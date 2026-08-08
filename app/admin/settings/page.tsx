import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Database } from "lucide-react";

import { seedSiteDefaultsAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-session";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Settings — ${BRAND_NAME}`,
};

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell session={session} title="Settings">
      <div className="max-w-2xl space-y-5">
        {/* Seed defaults card */}
        <div className="bg-white rounded-xl border border-[#e5ded5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece6] bg-[#faf9f7] flex items-center gap-2.5">
            <Database className="size-4 text-brand-gold flex-shrink-0" aria-hidden />
            <h2 className="text-sm font-semibold text-brand-text">Database Seeding</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-brand-muted leading-relaxed">
              Write the current product sizes, engraving styles, sample images, testimonials,
              rating summary, and delivery defaults into Firebase. Safe to run when setting up
              a new project or resetting to defaults.
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle
                className="size-4 text-amber-600 mt-0.5 flex-shrink-0"
                aria-hidden
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                This will overwrite existing catalog and testimonial data in Firebase. Only run
                on a fresh project setup.
              </p>
            </div>
            <form action={seedSiteDefaultsAction} className="mt-5">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors cursor-pointer"
              >
                <Database className="size-4" aria-hidden />
                Seed defaults
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
