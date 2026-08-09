import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_DELIVERY_SETTINGS,
  DEFAULT_PRODUCT,
  calculateLinePrice,
  deliverySettingsSchema,
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

test("defaults old delivery documents to the agreed regional fees", () => {
  const parsed = deliverySettingsSchema.parse({
    defaultDeliveryFee: 180,
    pickupLabel: "Free pickup",
    pickupAddress: "Maniki, Kapalong, Davao del Norte",
    rules: [],
  });

  assert.deepEqual(parsed.regionalFees, {
    mindanao: { baseFee: 85, markup: 0 },
    visayas: { baseFee: 105, markup: 0 },
    luzon: { baseFee: 135, markup: 0 },
  });
});

test("rejects malformed stored regional delivery amounts", () => {
  for (const invalidBaseFee of [null, false, "", "   ", 12.5, -1, 500001]) {
    const parsed = deliverySettingsSchema.safeParse({
      defaultDeliveryFee: 180,
      pickupLabel: "Free pickup",
      pickupAddress: "Maniki, Kapalong, Davao del Norte",
      rules: [],
      regionalFees: {
        mindanao: { baseFee: invalidBaseFee, markup: 0 },
        visayas: { baseFee: 105, markup: 0 },
        luzon: { baseFee: 135, markup: 0 },
      },
    });

    assert.equal(parsed.success, false, `accepted ${JSON.stringify(invalidBaseFee)}`);
  }
});

test("adds flat markups to regional base delivery fees", () => {
  const settings = {
    ...DEFAULT_DELIVERY_SETTINGS,
    regionalFees: {
      mindanao: { baseFee: 85, markup: 10 },
      visayas: { baseFee: 105, markup: 20 },
      luzon: { baseFee: 135, markup: 30 },
    },
    rules: [],
  };

  const cases = [
    ["1100000000", "mindanao", 95, "Mindanao delivery"],
    ["0700000000", "visayas", 125, "Visayas delivery"],
    ["1300000000", "luzon", 165, "Luzon delivery"],
  ] as const;

  for (const [regionCode, scope, fee, label] of cases) {
    assert.deepEqual(
      quoteDelivery({
        settings,
        fulfillmentType: "delivery",
        address: {
          region: "canonical label",
          regionCode,
          province: "canonical province",
          city: "canonical city",
          barangay: "canonical barangay",
        },
      }),
      { fulfillmentType: "delivery", fee, ruleId: null, scope, label },
    );
  }
});

test("quotes delivery by barangay, then city, then province, then regional fee", () => {
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
      regionCode: "0700000000",
      province: "Cebu",
      city: "City of Cebu",
      barangay: "Lahug",
    },
  });

  assert.equal(fallback.ruleId, null);
  assert.equal(fallback.scope, "visayas");
  assert.equal(fallback.fee, 105);
});

test("uses nationwide default for an unknown region code", () => {
  const quote = quoteDelivery({
    settings: { ...DEFAULT_DELIVERY_SETTINGS, rules: [] },
    fulfillmentType: "delivery",
    address: {
      region: "Unknown",
      regionCode: "9900000000",
      province: "Unknown",
      city: "Unknown",
      barangay: "Unknown",
    },
  });

  assert.equal(quote.scope, "default");
  assert.equal(quote.fee, DEFAULT_DELIVERY_SETTINGS.defaultDeliveryFee);
});
