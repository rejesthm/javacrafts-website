import assert from "node:assert/strict";
import test from "node:test";

import { parseDeliverySettingsForm } from "../lib/delivery-settings-form";

function regionalFormData() {
  const formData = new FormData();
  formData.set("defaultDeliveryFee", "180");
  formData.set("pickupLabel", "Free pickup");
  formData.set("pickupAddress", "Maniki, Kapalong, Davao del Norte");
  formData.set("mindanaoBaseFee", "85");
  formData.set("mindanaoMarkup", "10");
  formData.set("visayasBaseFee", "105");
  formData.set("visayasMarkup", "20");
  formData.set("luzonBaseFee", "135");
  formData.set("luzonMarkup", "30");
  return formData;
}

test("parses all regional fees without losing specific rules", () => {
  const formData = regionalFormData();
  formData.append("ruleId", "cebu-city");
  formData.append("ruleScope", "city");
  formData.append("ruleRegion", "Region VII (Central Visayas)");
  formData.append("ruleProvince", "Cebu");
  formData.append("ruleCity", "City of Cebu");
  formData.append("ruleBarangay", "");
  formData.append("ruleAmount", "90");
  formData.append("ruleActive", "0");

  const parsed = parseDeliverySettingsForm(formData);

  assert.deepEqual(parsed.regionalFees, {
    mindanao: { baseFee: 85, markup: 10 },
    visayas: { baseFee: 105, markup: 20 },
    luzon: { baseFee: 135, markup: 30 },
  });
  assert.equal(parsed.rules.length, 1);
  assert.equal(parsed.rules[0]?.id, "cebu-city");
  assert.equal(parsed.rules[0]?.amount, 90);
  assert.equal(parsed.rules[0]?.active, true);
});

test("rejects invalid regional peso values", () => {
  const formData = regionalFormData();
  formData.set("mindanaoBaseFee", "-1");

  assert.throws(() => parseDeliverySettingsForm(formData));
});

test("rejects blank regional peso values instead of converting them to zero", () => {
  const formData = regionalFormData();
  formData.set("visayasMarkup", "");

  assert.throws(() => parseDeliverySettingsForm(formData));
});
