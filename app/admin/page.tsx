import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, PackageCheck } from "lucide-react";

import { logoutAdminAction, updateOrderStatusAction } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/admin-auth";
import { getAdminSession } from "@/lib/admin-session";
import { FirebaseConfigError } from "@/lib/firebase/admin";
import { listRecentOrders, type AdminOrderRecord } from "@/lib/firebase/orders";
import { BRAND_NAME, getPrimaryContact } from "@/lib/site";
import { formatPeso } from "@/lib/order";

export const metadata: Metadata = {
  title: `Orders — ${BRAND_NAME}`,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function StatusSelect({ order }: { order: AdminOrderRecord }) {
  return (
    <form action={updateOrderStatusAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="orderId" value={order.orderId} />
      <select
        name="status"
        defaultValue={order.status}
        className="min-h-10 rounded-xl border border-brand-primary/15 bg-brand-cream px-3 text-sm font-medium text-brand-text focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/25"
        aria-label={`Status for order ${order.orderId}`}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ")}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-brand-bg transition hover:bg-brand-secondary"
      >
        Save
      </button>
    </form>
  );
}

function paymentStatusLabel(status: AdminOrderRecord["payment"]["status"]) {
  return status.replace("_", " ");
}

function PaymentSummary({ order }: { order: AdminOrderRecord }) {
  const payment = order.payment;
  const tone =
    payment.status === "paid"
      ? "border-green-300 bg-green-50 text-green-800"
      : payment.status === "failed" || payment.status === "expired"
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <div className="space-y-1 text-sm">
      <p
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}
      >
        {paymentStatusLabel(payment.status)}
      </p>
      <p className="font-semibold tabular-nums text-brand-text">
        {formatPeso(payment.amount)} via PayMongo QR
      </p>
      {payment.paidAt ? (
        <p className="text-xs text-brand-muted">Paid {formatDate(payment.paidAt)}</p>
      ) : null}
      {payment.paymentId ? (
        <p className="text-xs text-brand-muted">Payment ID: {payment.paymentId}</p>
      ) : null}
    </div>
  );
}

function OrderCard({ order }: { order: AdminOrderRecord }) {
  const contact = getPrimaryContact();
  return (
    <article className="rounded-[8px] border border-brand-primary/12 bg-brand-surface p-5 shadow-craft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
            {order.orderId}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-brand-text">
            {order.customer.name}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {formatDate(order.submittedAt)}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <PaymentSummary order={order} />
          <StatusSelect order={order} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-brand-primary/10 pt-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2 text-sm text-brand-muted">
          <p>
            <span className="font-semibold text-brand-text">Email:</span>{" "}
            <a className="hover:text-brand-gold" href={`mailto:${order.customer.email}`}>
              {order.customer.email}
            </a>
          </p>
          <p>
            <span className="font-semibold text-brand-text">Phone:</span>{" "}
            <a className="hover:text-brand-gold" href={`tel:${order.customer.phone}`}>
              {order.customer.phone}
            </a>
          </p>
          {order.customer.messenger ? (
            <p>
              <span className="font-semibold text-brand-text">Messenger:</span>{" "}
              {order.customer.messenger}
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-brand-text">Address:</span>{" "}
            {order.address.houseStreet}, {order.address.barangay},{" "}
            {order.address.city}, {order.address.region} {order.address.postalCode}
          </p>
          {contact ? (
            <a
              href={contact.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:text-brand-primary"
            >
              {contact.label}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-brand-text">
              {order.order.itemCount} item{order.order.itemCount === 1 ? "" : "s"}
            </p>
            <p className="text-lg font-bold tabular-nums text-brand-gold">
              {formatPeso(order.order.total)}
            </p>
          </div>
          <ul className="mt-3 space-y-3">
            {order.order.items.map((item) => (
              <li
                key={`${order.orderId}-${item.lineNumber}`}
                className="grid gap-3 rounded-[8px] bg-brand-cream p-3 sm:grid-cols-[80px_1fr]"
              >
                {item.photo.signedUrl ? (
                  <Image
                    src={item.photo.signedUrl}
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 rounded-[8px] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-brand-surface text-brand-gold">
                    <PackageCheck className="size-6" aria-hidden />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-brand-text">{item.customText}</p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {item.productName} · {item.sizeLabel} · {item.dimensions} ·{" "}
                    {formatPeso(item.price)}
                  </p>
                  <p className="mt-1 truncate text-xs text-brand-muted">
                    {item.photo.fileName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  let orders: AdminOrderRecord[] = [];
  let configError: string | null = null;
  try {
    orders = await listRecentOrders();
  } catch (err) {
    if (err instanceof FirebaseConfigError) {
      configError = err.message;
    } else {
      throw err;
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-brand-primary/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition hover:text-brand-gold"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to site
            </Link>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-brand-text">
              Checkout orders
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Signed in as {session.email}
            </p>
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-gold/35 bg-brand-surface px-5 text-sm font-semibold text-brand-text shadow-craft transition hover:bg-brand-cream hover:text-brand-gold"
            >
              Sign out
            </button>
          </form>
        </div>

        {configError ? (
          <div className="mt-8 rounded-[8px] border border-red-300 bg-red-50 p-5 text-sm text-red-900">
            Firebase Admin is not configured: {configError}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-[8px] border border-brand-primary/12 bg-brand-surface p-8 text-center shadow-craft">
            <PackageCheck className="mx-auto size-10 text-brand-gold" aria-hidden />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-brand-text">
              No orders yet
            </h2>
            <p className="mt-2 text-brand-muted">
              New checkout submissions will appear here after Firebase receives them.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
