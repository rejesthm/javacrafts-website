import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginClient } from "@/components/admin-login-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Section } from "@/components/ui/section";
import { getAdminSession } from "@/lib/admin-session";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin login — ${BRAND_NAME}`,
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Section className="py-16 sm:py-20">
          <AdminLoginClient />
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
