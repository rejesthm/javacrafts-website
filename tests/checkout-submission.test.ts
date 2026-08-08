import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCheckoutGhlPayload,
  buildOrderRecord,
  dataUrlToUpload,
  parseCheckoutFormData,
  repriceCheckoutSubmission,
} from "../lib/checkout-submission";
import { DEFAULT_DELIVERY_SETTINGS, DEFAULT_PRODUCT } from "../lib/catalog";

const photoBase64 = Buffer.from("photo bytes").toString("base64");
const photoDataUrl = `data:image/png;base64,${photoBase64}`;

function createFormData(options: {
  customText?: string;
  fulfillmentType?: "delivery" | "pickup";
  total?: string;
} = {}) {
  const {
    fulfillmentType = "delivery",
    total = "730",
  } = options;
  const customText = "customText" in options ? options.customText : "For Mama";
  const formData = new FormData();
  formData.set("name", " Maria Santos ");
  formData.set("email", " MARIA@example.com ");
  formData.set("phone", "0917 123 4567");
  formData.set("messenger", "facebook.com/maria");
  formData.set("country", "Philippines");
  formData.set("fulfillmentType", fulfillmentType);
  formData.set("houseStreet", "123 Rizal St.");
  formData.set("barangay", "Maniki");
  formData.set("barangayCode", "1102305021");
  formData.set("postalCode", "8113");
  formData.set("city", "Kapalong");
  formData.set("cityCode", "1102305000");
  formData.set("province", "Davao del Norte");
  formData.set("provinceCode", "1102300000");
  formData.set("region", "Region XI (Davao Region)");
  formData.set("regionCode", "1100000000");
  formData.set("saveForNextTime", "true");
  formData.set("pageSlug", "home");
  formData.set("offer", "Test offer");
  formData.set("total", total);
  const cartItem: Record<string, unknown> = {
    id: "cart-1",
    productId: DEFAULT_PRODUCT.id,
    productName: "Personalized Engraved Plaque",
    sizeId: "m",
    sizeLabel: "M",
    dimensions: "8x6 inches",
    sizePrice: 650,
    styleId: "sketch-style-engraving",
    styleName: "Sketch-style engraving",
    stylePriceAdjustment: 0,
    price: 650,
    photo: {
      dataUrl: photoDataUrl,
      name: "mama.png",
      type: "image/png",
      size: 1200,
    },
    createdAt: "2026-06-18T00:00:00.000Z",
  };
  if (customText !== undefined) cartItem.customText = customText;
  formData.set(
    "cart",
    JSON.stringify([cartItem]),
  );
  return formData;
}

function createRepricedSubmission(formData = createFormData()) {
  return repriceCheckoutSubmission({
    submission: parseCheckoutFormData(formData),
    product: DEFAULT_PRODUCT,
    deliverySettings: DEFAULT_DELIVERY_SETTINGS,
  });
}

test("parses checkout form data into validated lead and cart details", () => {
  const submission = parseCheckoutFormData(createFormData());

  assert.equal(submission.lead.name, "Maria Santos");
  assert.equal(submission.lead.email, "MARIA@example.com");
  assert.equal(submission.lead.address.country, "Philippines");
  assert.equal(submission.lead.fulfillmentType, "delivery");
  assert.equal(submission.cart.length, 1);
  assert.equal(submission.cart[0]?.customText, "For Mama");
  assert.equal(submission.cart[0]?.styleId, "sketch-style-engraving");
  assert.equal(submission.itemSubtotal, 650);
  assert.equal(submission.total, 730);
  assert.equal(submission.saveForNextTime, true);
});

test("reprices delivery from authoritative product, style, and delivery settings", () => {
  const submission = createRepricedSubmission(createFormData({ total: "1" }));

  assert.equal(submission.itemSubtotal, 650);
  assert.equal(submission.delivery.fee, 80);
  assert.equal(submission.delivery.ruleId, "local-kapalong");
  assert.equal(submission.delivery.scope, "city");
  assert.equal(submission.total, 730);
});

test("supports pickup with optional engraving text omitted", () => {
  const submission = createRepricedSubmission(
    createFormData({
      customText: undefined,
      fulfillmentType: "pickup",
      total: "650",
    }),
  );

  assert.equal(submission.lead.fulfillmentType, "pickup");
  assert.equal(submission.cart[0]?.customText, "");
  assert.equal(submission.delivery.fee, 0);
  assert.equal(submission.delivery.scope, "pickup");
  assert.equal(submission.total, 650);
});

test("converts data URLs into upload payloads", () => {
  const upload = dataUrlToUpload(photoDataUrl, "fallback.png", "image/png");

  assert.equal(upload.contentType, "image/png");
  assert.equal(upload.extension, "png");
  assert.equal(upload.buffer.toString(), "photo bytes");
});

test("builds an order record without embedding base64 photo data", () => {
  const submission = createRepricedSubmission();
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
  assert.equal(record.payment.amount, 730);
  assert.equal(record.payment.currency, "PHP");
  assert.equal(record.order.currency, "PHP");
  assert.equal(record.order.itemSubtotal, 650);
  assert.equal(record.order.deliveryFee, 80);
  assert.equal(record.order.total, 730);
  assert.equal(record.fulfillment.type, "delivery");
  assert.equal(record.fulfillment.deliveryScope, "city");
  assert.equal(record.order.items[0]?.styleName, "Sketch-style engraving");
  assert.equal(record.order.items[0]?.photo.storagePath, "orders/order-123/items/1-photo.png");
  assert.equal("base64" in record.order.items[0]!.photo, false);
});

test("builds a GHL payload copy with photo base64 for notification workflows", () => {
  const submission = createRepricedSubmission();
  const payload = buildCheckoutGhlPayload({
    orderId: "order-123",
    submission,
    submittedAt: "2026-06-18T10:00:00.000Z",
  });

  assert.equal(payload.orderId, "order-123");
  assert.equal(payload.order.items[0]?.photo.base64, photoBase64);
  assert.equal(payload.order.currency, "PHP");
  assert.equal(payload.order.itemSubtotal, 650);
  assert.equal(payload.order.deliveryFee, 80);
  assert.equal(payload.order.total, 730);
  assert.equal(payload.source, "nextjs-funnel");
  assert.equal(
    payload.productSummary,
    "1x Personalized Engraved Plaque (M, Sketch-style engraving)",
  );
  assert.equal(payload.customText, "For Mama");
  assert.deepEqual(payload.shippingAddress, {
    line1: "123 Rizal St.",
    line2: "Maniki",
    city: "Kapalong",
    state: "Davao del Norte",
    postalCode: "8113",
    country: "PH",
  });
  assert.equal(
    payload.address.full,
    "123 Rizal St., Maniki, Kapalong, Davao del Norte, Region XI (Davao Region), 8113, PH",
  );
  assert.deepEqual(payload.customer, {
    name: "Maria Santos",
    email: "MARIA@example.com",
    phone: "0917 123 4567",
    firstName: "Maria",
    lastName: "Santos",
  });
});
