import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  buildQrPaymentMethodPayload,
  buildQrPaymentIntentPayload,
  createPaymongoAuthHeader,
  getPaymongoQrExpirySeconds,
  normalizePaymongoWebhookEvent,
  pesosToCentavos,
  verifyPaymongoWebhookSignature,
} from "../lib/paymongo";

test("converts PHP pesos to PayMongo centavos", () => {
  assert.equal(pesosToCentavos(650), 65000);
  assert.equal(pesosToCentavos(1500.5), 150050);
});

test("rejects invalid PayMongo amounts before API calls", () => {
  assert.throws(() => pesosToCentavos(19.99), /minimum/i);
  assert.throws(() => pesosToCentavos(Number.NaN), /valid amount/i);
});

test("builds a QR Ph payment intent payload with order metadata", () => {
  const payload = buildQrPaymentIntentPayload({
    orderId: "order-123",
    amount: 650,
    customerEmail: "maria@example.com",
  });

  assert.equal(payload.data.attributes.amount, 65000);
  assert.equal(payload.data.attributes.currency, "PHP");
  assert.deepEqual(payload.data.attributes.payment_method_allowed, ["qrph"]);
  assert.equal(payload.data.attributes.description, "Java Crafts order order-123");
  assert.equal(payload.data.attributes.metadata.orderId, "order-123");
  assert.equal(payload.data.attributes.metadata.customerEmail, "maria@example.com");
});

test("creates a Basic auth header from a PayMongo API key", () => {
  assert.equal(
    createPaymongoAuthHeader("pk_test_123"),
    `Basic ${Buffer.from("pk_test_123:").toString("base64")}`,
  );
});

test("reads QR expiry seconds with a safe default", () => {
  assert.equal(getPaymongoQrExpirySeconds({}), 1800);
  assert.equal(
    getPaymongoQrExpirySeconds({ PAYMONGO_QR_EXPIRY_SECONDS: "900" }),
    900,
  );
});

test("builds a QR Ph payment method payload with billing and expiry", () => {
  const payload = buildQrPaymentMethodPayload({
    expirySeconds: 900,
    billing: {
      name: "Maria Santos",
      email: "maria@example.com",
      phone: "0917 123 4567",
      address: {
        country: "Philippines",
        houseStreet: "123 Rizal St.",
        barangay: "Maniki",
        postalCode: "8000",
        city: "Kapalong",
        region: "Davao del Norte",
      },
    },
  });

  assert.equal(payload.data.attributes.type, "qrph");
  assert.equal(payload.data.attributes.expiry_seconds, 900);
  assert.equal(payload.data.attributes.billing.email, "maria@example.com");
  assert.equal(payload.data.attributes.billing.address.country, "PH");
  assert.equal(payload.data.attributes.billing.address.line1, "123 Rizal St.");
  assert.equal(payload.data.attributes.billing.address.line2, "Maniki");
});

test("verifies PayMongo webhook signatures against the raw body", () => {
  const rawBody = JSON.stringify({ data: { id: "evt_123" } });
  const secret = "whsec_test";
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

  assert.equal(verifyPaymongoWebhookSignature(rawBody, secret, signature), true);
  assert.equal(verifyPaymongoWebhookSignature(rawBody, secret, "bad"), false);
});

test("normalizes payment paid webhook events", () => {
  const event = normalizePaymongoWebhookEvent({
    data: {
      id: "evt_123",
      type: "event",
      attributes: {
        type: "payment.paid",
        data: {
          id: "pay_123",
          type: "payment",
          attributes: {
            amount: 65000,
            currency: "PHP",
            payment_intent_id: "pi_123",
            paid_at: 1780000000,
            metadata: {
              orderId: "order-123",
            },
          },
        },
      },
    },
  });

  assert.equal(event.eventId, "evt_123");
  assert.equal(event.eventType, "payment.paid");
  assert.equal(event.paymentIntentId, "pi_123");
  assert.equal(event.paymentId, "pay_123");
  assert.equal(event.orderId, "order-123");
  assert.equal(event.status, "paid");
  assert.equal(event.paidAt, new Date(1780000000 * 1000).toISOString());
});
