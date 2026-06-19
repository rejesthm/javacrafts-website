import "server-only";

import {
  buildCheckoutGhlPayload,
  buildGhlCustomTextSummary,
  buildGhlFullAddress,
  buildGhlProductSummary,
  buildGhlShippingAddress,
  splitName,
  type CheckoutSubmission,
  type GhlSummaryItem,
  type OrderRecord,
} from "@/lib/checkout-submission";
import type { NormalizedPaymongoWebhookEvent, OrderPayment } from "@/lib/paymongo";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GHL_SOURCE,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";

export type ForwardResult =
  | { ok: true; skipped: false }
  | { ok: false; skipped: true; reason: "missing_webhook" }
  | { ok: false; skipped: false; reason: string };

async function postToGhl(payload: unknown, logPrefix: string): Promise<ForwardResult> {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) return { ok: false, skipped: true, reason: "missing_webhook" };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[${logPrefix}] GHL webhook responded ${res.status}.`);
      return { ok: false, skipped: false, reason: `status_${res.status}` };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    console.error(`[${logPrefix}] GHL webhook request failed:`, err);
    return { ok: false, skipped: false, reason: "request_failed" };
  }
}

function paymentEventType(status: NormalizedPaymongoWebhookEvent["status"]) {
  switch (status) {
    case "paid":
      return "payment_paid";
    case "expired":
      return "payment_expired";
    default:
      return "payment_failed";
  }
}

export async function forwardCheckoutToGhl({
  orderId,
  submission,
  submittedAt,
  payment,
}: {
  orderId: string;
  submission: CheckoutSubmission;
  submittedAt: string;
  payment?: OrderPayment;
}) {
  const payload = buildCheckoutGhlPayload({ orderId, submission, submittedAt });
  return postToGhl(
    {
      eventType: "checkout_pending_payment",
      ...payload,
      payment: payment
        ? {
            provider: payment.provider,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            expiresAt: payment.expiresAt,
          }
        : undefined,
    },
    "checkout",
  );
}

export async function forwardCheckoutLeadToGhl({
  name,
  email,
  submittedAt,
  pageSlug,
  offer,
  cart,
}: {
  name: string;
  email: string;
  submittedAt: string;
  pageSlug?: string;
  offer?: string;
  cart?: {
    itemCount: number;
    total: number;
    items: Array<GhlSummaryItem & { price?: number }>;
  };
}) {
  const { firstName, lastName } = splitName(name);
  const orderSummary = cart
    ? {
        itemCount: cart.itemCount,
        total: cart.total,
        currency: "PHP" as const,
      }
    : undefined;
  return postToGhl(
    {
      eventType: "checkout_lead_capture",
      submittedAt,
      name,
      email,
      firstName,
      lastName,
      customer: {
        name,
        email,
        firstName,
        lastName,
      },
      cart: cart
        ? {
            itemCount: cart.itemCount,
            total: cart.total,
            currency: "PHP",
            items: cart.items,
          }
        : undefined,
      order: orderSummary,
      productSummary: cart ? buildGhlProductSummary(cart.items) : undefined,
      customText: cart ? buildGhlCustomTextSummary(cart.items) : undefined,
      source: GHL_SOURCE,
      pageSlug: pageSlug || GHL_PAGE_SLUG_HOME,
      offer: offer || OFFER,
      businessCategory: BUSINESS_CATEGORY,
      goal: GOAL_TAG,
    },
    "checkout-lead",
  );
}

export async function forwardPaymentUpdateToGhl({
  order,
  event,
}: {
  order: OrderRecord;
  event: NormalizedPaymongoWebhookEvent;
}) {
  const { firstName, lastName } = splitName(order.customer.name);
  const summaryItems = order.order.items.map((item) => ({
    productName: item.productName,
    size: item.sizeLabel,
    customText: item.customText,
  }));

  return postToGhl(
    {
      eventType: paymentEventType(event.status),
      orderId: order.orderId,
      customer: {
        ...order.customer,
        firstName,
        lastName,
      },
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      firstName,
      lastName,
      address: {
        ...order.address,
        full: buildGhlFullAddress(order.address),
      },
      shippingAddress: buildGhlShippingAddress(order.address),
      order: {
        itemCount: order.order.itemCount,
        total: order.order.total,
        currency: order.order.currency,
      },
      productSummary: buildGhlProductSummary(summaryItems),
      customText: buildGhlCustomTextSummary(summaryItems),
      payment: {
        ...order.payment,
        qrImageUrl: undefined,
      },
      paymongoEvent: {
        eventId: event.eventId,
        eventType: event.eventType,
        paymentIntentId: event.paymentIntentId,
        paymentId: event.paymentId,
      },
      source: GHL_SOURCE,
      pageSlug: order.source.pageSlug,
      offer: order.source.offer,
      businessCategory: BUSINESS_CATEGORY,
      goal: GOAL_TAG,
    },
    "payment-update",
  );
}
