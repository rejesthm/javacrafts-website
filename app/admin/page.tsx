import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminOrdersLive } from "@/components/admin-orders-live";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-session";
import { FirebaseConfigError } from "@/lib/firebase/admin";
import { listRecentOrders, type AdminOrderRecord } from "@/lib/firebase/orders";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Orders — ${BRAND_NAME}`,
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  let orders: AdminOrderRecord[] = [];
  let configError: string | null = null;
  try {
    orders = await listRecentOrders();
  } catch (error) {
    if (error instanceof FirebaseConfigError) configError = error.message;
    else throw error;
  }

  return (
    <AdminShell session={session} title="Orders">
      {configError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Firebase Admin is not configured: {configError}
        </div>
      ) : (
        <AdminOrdersLive initialOrders={orders} />
      )}
    </AdminShell>
  );
}
