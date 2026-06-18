"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isOrderStatus } from "@/lib/admin-auth";
import { clearAdminSession, requireAdminSession } from "@/lib/admin-session";
import { updateOrderStatus } from "@/lib/firebase/orders";

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession();
  const orderId = String(formData.get("orderId") ?? "");
  const status = formData.get("status");
  if (!orderId) throw new Error("Missing order id.");
  if (!isOrderStatus(status)) throw new Error("Invalid order status.");

  await updateOrderStatus(orderId, status);
  revalidatePath("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
