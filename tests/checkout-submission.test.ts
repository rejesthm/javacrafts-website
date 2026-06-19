import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCheckoutGhlPayload,
  buildOrderRecord,
  dataUrlToUpload,
  parseCheckoutFormData,
} from "../lib/checkout-submission";

const photoBase64 = Buffer.from("photo bytes").toString("base64");
const photoDataUrl = `data:image/png;base64,${photoBase64}`;

function createFormData() {
  const formData = new FormData();
  formData.set("name", " Maria Santos ");
  formData.set("email", " MARIA@example.com ");
  formData.set("phone", "0917 123 4567");
  formData.set("messenger", "facebook.com/maria");
  formData.set("country", "Philippines");
  formData.set("houseStreet", "123 Rizal St.");
  formData.set("barangay", "Maniki");
  formData.set("postalCode", "8000");
  formData.set("city", "Kapalong");
  formData.set("region", "Davao del Norte");
  formData.set("saveForNextTime", "true");
  formData.set("pageSlug", "home");
  formData.set("offer", "Test offer");
  formData.set("total", "650");
  formData.set(
    "cart",
    JSON.stringify([
      {
        id: "cart-1",
        productName: "Personalized Engraved Plaque",
        sizeId: "m",
        sizeLabel: "M",
        dimensions: "8x6 inches",
        price: 650,
        customText: "For Mama",
        photo: {
          dataUrl: photoDataUrl,
          name: "mama.png",
          type: "image/png",
          size: 1200,
        },
        createdAt: "2026-06-18T00:00:00.000Z",
      },
    ]),
  );
  return formData;
}

test("parses checkout form data into validated lead and cart details", () => {
  const submission = parseCheckoutFormData(createFormData());

  assert.equal(submission.lead.name, "Maria Santos");
  assert.equal(submission.lead.email, "MARIA@example.com");
  assert.equal(submission.lead.address.country, "Philippines");
  assert.equal(submission.cart.length, 1);
  assert.equal(submission.cart[0]?.customText, "For Mama");
  assert.equal(submission.total, 650);
  assert.equal(submission.saveForNextTime, true);
});

test("converts data URLs into upload payloads", () => {
  const upload = dataUrlToUpload(photoDataUrl, "fallback.png", "image/png");

  assert.equal(upload.contentType, "image/png");
  assert.equal(upload.extension, "png");
  assert.equal(upload.buffer.toString(), "photo bytes");
});

test("builds an order record without embedding base64 photo data", () => {
  const submission = parseCheckoutFormData(createFormData());
  const record = buildOrderRecord({
    orderId: "order-123",
    submission,
    submittedAt: "2026-06-18T10:00:00.000Z",
    photoPaths: ["orders/order-123/items/1-photo.png"],
  });

  assert.equal(record.orderId, "order-123");
  assert.equal(record.status, "new");
  assert.equal(record.payment.provider, "paymongo");
  assert.equal(record.payment.method, "qrph");
  assert.equal(record.payment.status, "pending");
  assert.equal(record.payment.amount, 650);
  assert.equal(record.payment.currency, "PHP");
  assert.equal(record.order.currency, "PHP");
  assert.equal(record.order.items[0]?.photo.storagePath, "orders/order-123/items/1-photo.png");
  assert.equal("base64" in record.order.items[0]!.photo, false);
});

test("builds a GHL payload copy with photo base64 for notification workflows", () => {
  const submission = parseCheckoutFormData(createFormData());
  const payload = buildCheckoutGhlPayload({
    orderId: "order-123",
    submission,
    submittedAt: "2026-06-18T10:00:00.000Z",
  });

  assert.equal(payload.orderId, "order-123");
  assert.equal(payload.order.items[0]?.photo.base64, photoBase64);
  assert.equal(payload.order.currency, "PHP");
  assert.equal(payload.source, "nextjs-funnel");
  assert.equal(payload.productSummary, "1x Personalized Engraved Plaque (M)");
  assert.equal(payload.customText, "For Mama");
  assert.deepEqual(payload.shippingAddress, {
    line1: "123 Rizal St.",
    line2: "Maniki",
    city: "Kapalong",
    state: "Davao del Norte",
    postalCode: "8000",
    country: "PH",
  });
  assert.equal(
    payload.address.full,
    "123 Rizal St., Maniki, Kapalong, Davao del Norte, 8000, PH",
  );
  assert.deepEqual(payload.customer, {
    name: "Maria Santos",
    email: "MARIA@example.com",
    phone: "0917 123 4567",
    firstName: "Maria",
    lastName: "Santos",
  });
});
