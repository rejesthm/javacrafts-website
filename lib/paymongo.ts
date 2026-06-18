import { createHmac, timingSafeEqual } from "node:crypto";

import type { CheckoutSubmission } from "@/lib/checkout-submission";

const PAYMONGO_API_BASE = "https://api.paymongo.com";

export class PaymongoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymongoConfigError";
  }
}

export class PaymongoApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "PaymongoApiError";
  }
}

export type PaymongoPaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "expired";

export type OrderPayment = {
  provider: "paymongo";
  method: "qrph";
  amount: number;
  currency: "PHP";
  status: PaymongoPaymentStatus;
  paymongoPaymentIntentId: string | null;
  paymongoPaymentMethodId: string | null;
  qrImageUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  paymentId: string | null;
  webhookEventIds: string[];
};

export type PublicOrderPayment = Pick<
  OrderPayment,
  | "provider"
  | "method"
  | "amount"
  | "currency"
  | "status"
  | "qrImageUrl"
  | "expiresAt"
  | "paidAt"
  | "paymentId"
>;

type BillingDetails = {
  name: string;
  email: string;
  phone: string;
  address: {
    country: "Philippines";
    houseStreet: string;
    barangay: string;
    postalCode: string;
    city: string;
    region: string;
  };
};

export type NormalizedPaymongoWebhookEvent = {
  eventId: string;
  eventType: string;
  status: Extract<PaymongoPaymentStatus, "paid" | "failed" | "expired">;
  orderId: string | null;
  paymentIntentId: string | null;
  paymentId: string | null;
  amount: number | null;
  currency: string | null;
  paidAt: string | null;
};

export function pesosToCentavos(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("PayMongo requires a valid amount.");
  }

  const centavos = Math.round(amount * 100);
  if (centavos < 2000) {
    throw new Error("PayMongo requires a minimum amount of PHP 20.00.");
  }

  return centavos;
}

export function createPendingQrPayment(amount: number): OrderPayment {
  return {
    provider: "paymongo",
    method: "qrph",
    amount,
    currency: "PHP",
    status: "pending",
    paymongoPaymentIntentId: null,
    paymongoPaymentMethodId: null,
    qrImageUrl: null,
    expiresAt: null,
    paidAt: null,
    paymentId: null,
    webhookEventIds: [],
  };
}

export function createPaymongoAuthHeader(apiKey: string) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

export function getPaymongoQrExpirySeconds(env?: {
  PAYMONGO_QR_EXPIRY_SECONDS?: string;
}) {
  const raw = env?.PAYMONGO_QR_EXPIRY_SECONDS ?? process.env.PAYMONGO_QR_EXPIRY_SECONDS;
  const parsed = raw ? Number(raw) : 1800;
  if (!Number.isFinite(parsed)) return 1800;
  return Math.min(9000, Math.max(60, Math.trunc(parsed)));
}

export function buildQrPaymentIntentPayload({
  orderId,
  amount,
  customerEmail,
}: {
  orderId: string;
  amount: number;
  customerEmail: string;
}) {
  return {
    data: {
      attributes: {
        amount: pesosToCentavos(amount),
        currency: "PHP",
        payment_method_allowed: ["qrph"],
        description: `Java Crafts order ${orderId}`,
        metadata: {
          orderId,
          customerEmail,
        },
      },
    },
  };
}

export function buildQrPaymentMethodPayload({
  billing,
  expirySeconds,
}: {
  billing: BillingDetails;
  expirySeconds: number;
}) {
  return {
    data: {
      attributes: {
        type: "qrph",
        expiry_seconds: expirySeconds,
        billing: {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
          address: {
            line1: billing.address.houseStreet,
            line2: billing.address.barangay,
            city: billing.address.city,
            state: billing.address.region,
            postal_code: billing.address.postalCode,
            country: "PH",
          },
        },
      },
    },
  };
}

export function toPublicOrderPayment(payment: OrderPayment): PublicOrderPayment {
  return {
    provider: payment.provider,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    qrImageUrl: payment.qrImageUrl,
    expiresAt: payment.expiresAt,
    paidAt: payment.paidAt,
    paymentId: payment.paymentId,
  };
}

function requirePaymongoEnv(name: "PAYMONGO_SECRET_KEY" | "PAYMONGO_PUBLIC_KEY") {
  const value = process.env[name];
  if (!value) throw new PaymongoConfigError(`Missing required PayMongo env var: ${name}`);
  return value;
}

async function postToPaymongo({
  path,
  apiKey,
  body,
}: {
  path: string;
  apiKey: string;
  body: unknown;
}) {
  const res = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: createPaymongoAuthHeader(apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    throw new PaymongoApiError(
      `PayMongo request failed for ${path}.`,
      res.status,
    );
  }
  return payload;
}

function resourceId(payload: unknown, expectedType: string) {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new PaymongoApiError(`Invalid PayMongo ${expectedType} response.`);
  }
  const id = stringValue(payload.data.id);
  if (!id) throw new PaymongoApiError(`Missing PayMongo ${expectedType} id.`);
  return id;
}

function resourceAttributes(payload: unknown, expectedType: string) {
  if (
    !isRecord(payload) ||
    !isRecord(payload.data) ||
    !isRecord(payload.data.attributes)
  ) {
    throw new PaymongoApiError(`Invalid PayMongo ${expectedType} response.`);
  }
  return payload.data.attributes;
}

function extractClientKey(payload: unknown) {
  const key = stringValue(resourceAttributes(payload, "payment intent").client_key);
  if (!key) throw new PaymongoApiError("Missing PayMongo payment intent client key.");
  return key;
}

function extractQrImageUrl(payload: unknown) {
  const attributes = resourceAttributes(payload, "attached payment intent");
  const nextAction = isRecord(attributes.next_action) ? attributes.next_action : null;
  const code = nextAction && isRecord(nextAction.code) ? nextAction.code : null;
  const imageUrl = code ? stringValue(code.image_url) : null;
  if (!imageUrl) throw new PaymongoApiError("Missing PayMongo QR image URL.");
  return imageUrl;
}

export async function createPaymongoQrPayment({
  orderId,
  submission,
}: {
  orderId: string;
  submission: CheckoutSubmission;
}): Promise<OrderPayment> {
  const secretKey = requirePaymongoEnv("PAYMONGO_SECRET_KEY");
  const publicKey = requirePaymongoEnv("PAYMONGO_PUBLIC_KEY");
  const expirySeconds = getPaymongoQrExpirySeconds();

  const intentPayload = await postToPaymongo({
    path: "/v1/payment_intents",
    apiKey: secretKey,
    body: buildQrPaymentIntentPayload({
      orderId,
      amount: submission.total,
      customerEmail: submission.lead.email,
    }),
  });
  const paymentIntentId = resourceId(intentPayload, "payment intent");
  const clientKey = extractClientKey(intentPayload);

  const methodPayload = await postToPaymongo({
    path: "/v1/payment_methods",
    apiKey: publicKey,
    body: buildQrPaymentMethodPayload({
      expirySeconds,
      billing: {
        name: submission.lead.name,
        email: submission.lead.email,
        phone: submission.lead.phone,
        address: submission.lead.address,
      },
    }),
  });
  const paymentMethodId = resourceId(methodPayload, "payment method");

  const attachedPayload = await postToPaymongo({
    path: `/v1/payment_intents/${paymentIntentId}/attach`,
    apiKey: publicKey,
    body: {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          client_key: clientKey,
        },
      },
    },
  });

  return {
    ...createPendingQrPayment(submission.total),
    status: "awaiting_payment",
    paymongoPaymentIntentId: paymentIntentId,
    paymongoPaymentMethodId: paymentMethodId,
    qrImageUrl: extractQrImageUrl(attachedPayload),
    expiresAt: new Date(Date.now() + expirySeconds * 1000).toISOString(),
  };
}

export function verifyPaymongoWebhookSignature(
  rawBody: string,
  secret: string,
  signatureHeader: string | null | undefined,
) {
  if (!signatureHeader || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function timestampToIso(value: unknown) {
  const timestamp = numberValue(value);
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function paymentStatusForEvent(
  eventType: string,
): NormalizedPaymongoWebhookEvent["status"] | null {
  if (eventType === "payment.paid") return "paid";
  if (eventType === "payment.failed") return "failed";
  if (eventType === "qrph.expired") return "expired";
  return null;
}

export function normalizePaymongoWebhookEvent(
  payload: unknown,
): NormalizedPaymongoWebhookEvent {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new Error("Invalid PayMongo webhook payload.");
  }

  const eventId = stringValue(payload.data.id);
  const eventAttributes = isRecord(payload.data.attributes)
    ? payload.data.attributes
    : null;
  const eventType = eventAttributes
    ? stringValue(eventAttributes.type)
    : null;
  const status = eventType ? paymentStatusForEvent(eventType) : null;
  const resource = eventAttributes && isRecord(eventAttributes.data)
    ? eventAttributes.data
    : null;
  const resourceAttributes = resource && isRecord(resource.attributes)
    ? resource.attributes
    : null;
  const metadata = resourceAttributes && isRecord(resourceAttributes.metadata)
    ? resourceAttributes.metadata
    : null;

  if (!eventId || !eventType || !status || !resourceAttributes) {
    throw new Error("Unsupported PayMongo webhook payload.");
  }

  const paymongoResourceId = resource ? stringValue(resource.id) : null;

  return {
    eventId,
    eventType,
    status,
    orderId: metadata ? stringValue(metadata.orderId) : null,
    paymentIntentId:
      stringValue(resourceAttributes.payment_intent_id) ||
      paymongoResourceId,
    paymentId: eventType.startsWith("payment.")
      ? paymongoResourceId
      : null,
    amount: numberValue(resourceAttributes.amount),
    currency: stringValue(resourceAttributes.currency),
    paidAt: timestampToIso(resourceAttributes.paid_at),
  };
}
