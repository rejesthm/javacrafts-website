import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_DELIVERY_SETTINGS,
  DEFAULT_PRODUCT,
  calculateLinePrice,
  quoteDelivery,
  type DeliverySettings,
} from "../lib/catalog";

test("calculates product line price from selected size and style adjustment", () => {
  const product = {
    ...DEFAULT_PRODUCT,
    styles: DEFAULT_PRODUCT.styles.map((style) =>
      style.id === "sketch-style-engraving"
        ? { ...style, priceAdjustment: 75 }
        : style,
    ),
  };

  const line = calculateLinePrice({
    product,
    sizeId: "m",
    styleId: "sketch-style-engraving",
  });

  assert.equal(line.size.price, 650);
  assert.equal(line.style.priceAdjustment, 75);
  assert.equal(line.price, 725);
});

test("quotes delivery by barangay, then city, then province, then default", () => {
  const settings: DeliverySettings = {
    ...DEFAULT_DELIVERY_SETTINGS,
    defaultDeliveryFee: 180,
    rules: [
      {
        id: "province-rule",
        scope: "province",
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "",
        barangay: "",
        amount: 120,
        active: true,
        sortOrder: 3,
      },
      {
        id: "city-rule",
        scope: "city",
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "Kapalong",
        barangay: "",
        amount: 80,
        active: true,
        sortOrder: 2,
      },
      {
        id: "barangay-rule",
        scope: "barangay",
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "Kapalong",
        barangay: "Maniki",
        amount: 50,
        active: true,
        sortOrder: 1,
      },
    ],
  };

  assert.deepEqual(
    quoteDelivery({
      settings,
      fulfillmentType: "pickup",
    }),
    {
      fulfillmentType: "pickup",
      fee: 0,
      ruleId: null,
      scope: "pickup",
      label: "Free pickup",
    },
  );

  assert.equal(
    quoteDelivery({
      settings,
      fulfillmentType: "delivery",
      address: {
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "Kapalong",
        barangay: "Maniki",
      },
    }).ruleId,
    "barangay-rule",
  );

  assert.equal(
    quoteDelivery({
      settings,
      fulfillmentType: "delivery",
      address: {
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "Kapalong",
        barangay: "Mabantao",
      },
    }).ruleId,
    "city-rule",
  );

  assert.equal(
    quoteDelivery({
      settings,
      fulfillmentType: "delivery",
      address: {
        region: "Region XI (Davao Region)",
        province: "Davao del Norte",
        city: "Asuncion",
        barangay: "Buan",
      },
    }).ruleId,
    "province-rule",
  );

  const fallback = quoteDelivery({
    settings,
    fulfillmentType: "delivery",
    address: {
      region: "Region VII (Central Visayas)",
      province: "Cebu",
      city: "City of Cebu",
      barangay: "Lahug",
    },
  });

  assert.equal(fallback.ruleId, null);
  assert.equal(fallback.scope, "default");
  assert.equal(fallback.fee, 180);
});
