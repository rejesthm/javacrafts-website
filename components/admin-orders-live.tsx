"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { updateOrderStatusAction } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/admin-auth";
import type { AdminOrderRecord } from "@/lib/firebase/orders";
import { formatPeso } from "@/lib/order";

type OrderStatus = AdminOrderRecord["status"];
type PaymentStatus = AdminOrderRecord["payment"]["status"];

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  contacted: { label: "Contacted", className: "bg-violet-50 text-violet-700 ring-violet-600/20" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500 ring-slate-500/20" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  awaiting_payment: { label: "Awaiting Payment", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-600/20" },
  expired: { label: "Expired", className: "bg-red-50 text-red-700 ring-red-600/20" },
};

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function StatusBadge({ status, payment = false }: { status: OrderStatus | PaymentStatus; payment?: boolean }) {
  const config = payment
    ? paymentStatusConfig[status as PaymentStatus]
    : orderStatusConfig[status as OrderStatus];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}>
      {config.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#e5ded5] bg-white p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-tight tabular-nums text-brand-text">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-brand-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

function formatFulfillment(order: AdminOrderRecord) {
  if (order.fulfillment.type === "pickup") return order.fulfillment.label || "Pickup";
  return [order.address.city, order.address.province].filter(Boolean).join(", ") || "—";
}

export function AdminOrdersLive({ initialOrders }: { initialOrders: AdminOrderRecord[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/admin/orders/stream");
    const onSnapshot = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as { orders?: AdminOrderRecord[] };
        if (data.orders) setOrders(data.orders);
        setConnectionError(false);
      } catch {
        setConnectionError(true);
      }
    };
    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.addEventListener("stream-error", () => setConnectionError(true));
    source.onerror = () => setConnectionError(true);
    return () => {
      source.removeEventListener("snapshot", onSnapshot as EventListener);
      source.close();
    };
  }, []);

  const pendingOrders = orders.filter((order) => ["new", "contacted", "in_progress"].includes(order.status)).length;
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const revenue = orders.filter((order) => order.payment.status === "paid").reduce((sum, order) => sum + order.payment.amount, 0);

  return (
    <>
      {connectionError ? (
        <div role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Live order updates disconnected. Reconnecting…
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} />
        <StatCard label="Pending" value={pendingOrders} icon={Clock} sub="new / contacted / in progress" />
        <StatCard label="Revenue" value={formatPeso(revenue)} icon={TrendingUp} sub="from paid orders" />
        <StatCard label="Completed" value={completedOrders} icon={CheckCircle2} />
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted">Recent Orders</h2>
          <span className="text-xs text-brand-muted">Showing {orders.length} orders</span>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-[#e5ded5] bg-white p-12 text-center">
            <PackageCheck className="mx-auto size-10 text-brand-gold/50" aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-brand-text">No orders yet</h3>
            <p className="mt-1 text-sm text-brand-muted">New checkout submissions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e5ded5] bg-white">
            <table className="min-w-full text-sm">
              <thead><tr className="border-b border-[#e5ded5] bg-[#faf9f7]">
                {['Order', 'Customer', 'Fulfillment', 'Items', 'Total', 'Payment', 'Status', 'Update'].map((heading) => (
                  <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-muted">{heading}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#f0ece6]">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors duration-150 hover:bg-[#faf9f7]">
                    <td className="whitespace-nowrap px-4 py-3"><span className="rounded border border-[#e5ded5] bg-[#f8f6f3] px-2 py-0.5 font-mono text-xs font-semibold text-brand-text">{order.orderId}</span><p className="mt-1 text-xs text-brand-muted">{formatDateShort(order.submittedAt)}</p></td>
                    <td className="whitespace-nowrap px-4 py-3"><p className="font-semibold text-brand-text">{order.customer.name}</p><a href={`tel:${order.customer.phone}`} className="text-xs text-brand-muted transition-colors hover:text-brand-gold">{order.customer.phone}</a></td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted">{formatFulfillment(order)}</td>
                    <td className="px-4 py-3"><p className="text-sm text-brand-text">{order.order.itemCount} item{order.order.itemCount === 1 ? "" : "s"}</p><p className="max-w-[180px] truncate text-xs text-brand-muted">{order.order.items[0]?.customText || order.order.items[0]?.productName}{order.order.itemCount > 1 ? ` +${order.order.itemCount - 1} more` : ""}</p></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-brand-text">{formatPeso(order.order.total)}</td>
                    <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.payment.status} payment /></td>
                    <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <form action={updateOrderStatusAction} className="flex items-center gap-2">
                        <input type="hidden" name="orderId" value={order.orderId} />
                        <select key={`${order.id}-${order.status}`} name="status" defaultValue={order.status} className="min-h-9 cursor-pointer rounded-lg border border-[#e5ded5] bg-white px-3 text-xs font-medium text-brand-text focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20" aria-label={`Status for order ${order.orderId}`}>
                          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                        </select>
                        <button type="submit" className="inline-flex min-h-9 items-center justify-center rounded-lg bg-brand-text px-4 text-xs font-semibold text-white transition hover:bg-brand-secondary">Update</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
