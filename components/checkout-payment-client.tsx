"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { formatPeso } from "@/lib/order";
import { getPrimaryContact } from "@/lib/site";

type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "expired";

type PaymentDetails = {
  provider: "paymongo";
  method: "qrph";
  amount: number;
  currency: "PHP";
  status: PaymentStatus;
  qrImageUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  paymentId: string | null;
};

type PaymentResponse =
  | { ok: true; orderId: string; payment: PaymentDetails }
  | { ok?: false; error?: string };

function formatExpiry(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function CheckoutPaymentClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { clearCart } = useCart();
  const contact = getPrimaryContact();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const waiting =
    payment?.status === "pending" || payment?.status === "awaiting_payment";
  const expiredOrFailed =
    payment?.status === "expired" || payment?.status === "failed";
  const expiresAt = useMemo(
    () => formatExpiry(payment?.expiresAt ?? null),
    [payment?.expiresAt],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function loadStatus() {
      try {
        const res = await fetch(`/api/checkout/payment/${orderId}`, {
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as PaymentResponse;
        if (cancelled) return;

        if (!res.ok) {
          setError(
            "error" in data && data.error
              ? data.error
              : "We couldn't load your payment status.",
          );
          return;
        }

        if (!data.ok) {
          setError(data.error ?? "We couldn't load your payment status.");
          return;
        }

        setPayment(data.payment);
        setError(null);

        if (data.payment.status === "paid") {
          clearCart();
          router.replace(`/thank-you?order=${orderId}`);
          return;
        }

        if (
          data.payment.status === "pending" ||
          data.payment.status === "awaiting_payment"
        ) {
          timer = setTimeout(loadStatus, 2500);
        }
      } catch {
        if (!cancelled) {
          setError("Network error while checking payment status.");
          timer = setTimeout(loadStatus, 4000);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clearCart, orderId, router]);

  return (
    <Section className="py-12 sm:py-16">
      <Link
        href="/checkout"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition hover:text-brand-gold"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to checkout
      </Link>

      <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="rounded-[8px] border border-brand-gold/15 bg-brand-surface p-5 shadow-craft ring-1 ring-brand-gold/5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cream text-brand-gold ring-1 ring-brand-gold/20">
              <QrCode className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                PayMongo QR Ph
              </p>
              <h1 className="font-serif text-3xl font-semibold text-brand-text">
                Scan to pay
              </h1>
            </div>
          </div>

          <div className="mt-6 rounded-[8px] border border-brand-primary/12 bg-brand-cream p-4 text-center">
            {payment?.qrImageUrl ? (
              <Image
                src={payment.qrImageUrl}
                alt="PayMongo QR Ph code"
                width={320}
                height={320}
                unoptimized
                className="mx-auto aspect-square w-full max-w-[320px] rounded-[8px] bg-white object-contain p-3 shadow-craft"
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-[8px] bg-brand-surface text-brand-muted">
                <Loader2 className="size-8 animate-spin" aria-hidden />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-brand-text">
              Order ID: <span className="tabular-nums">{orderId}</span>
            </p>
            {payment ? (
              <p className="rounded-full bg-brand-cream px-4 py-2 text-sm font-bold tabular-nums text-brand-gold">
                {formatPeso(payment.amount)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[8px] border border-brand-primary/12 bg-brand-surface p-5 shadow-craft sm:p-7">
          {loading && !payment ? (
            <div className="flex items-center gap-3 text-brand-muted">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Preparing your QR payment...
            </div>
          ) : null}

          {waiting ? (
            <div>
              <div className="flex items-center gap-3 text-brand-text">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Clock3 className="size-6" aria-hidden />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-semibold">
                    Waiting for payment
                  </h2>
                  <p className="text-sm text-brand-muted">
                    This page updates automatically after PayMongo confirms your payment.
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-brand-muted">
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden />
                  Scan the QR using your banking or e-wallet app.
                </li>
                <li className="flex gap-2">
                  <RefreshCw className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden />
                  Keep this tab open while we wait for confirmation.
                </li>
                {expiresAt ? (
                  <li className="flex gap-2">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden />
                    This QR expires around {expiresAt}.
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {payment?.status === "paid" ? (
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="size-7" aria-hidden />
              Payment received. Sending you to the thank-you page...
            </div>
          ) : null}

          {expiredOrFailed ? (
            <div>
              <h2 className="font-serif text-2xl font-semibold text-brand-text">
                This QR can&apos;t be used anymore
              </h2>
              <p className="mt-2 text-brand-muted">
                Please return to checkout to generate a fresh QR, or message us and
                we&apos;ll help you finish the order.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="min-h-11 rounded-full bg-brand-primary px-6 text-brand-bg hover:bg-brand-secondary"
                  asChild
                >
                  <Link href="/checkout">Return to checkout</Link>
                </Button>
                {contact ? (
                  <Button
                    variant="outline"
                    className="min-h-11 rounded-full border-brand-gold/40 bg-brand-surface px-6 text-brand-text hover:bg-brand-cream hover:text-brand-gold"
                    asChild
                  >
                    <a href={contact.href}>
                      <MessageCircle className="mr-2 size-4" aria-hidden />
                      {contact.label}
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-5 rounded-[8px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
