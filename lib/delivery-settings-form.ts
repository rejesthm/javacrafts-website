import {
  deliverySettingsSchema,
  normalizeSlug,
  type DeliveryFeeRule,
  type DeliveryRuleScope,
  type DeliverySettings,
} from "@/lib/catalog";

function formStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function formNumber(value: string) {
  if (!value.trim()) return Number.NaN;
  return Number(value);
}

function indexedActive(formData: FormData, key: string, index: number) {
  return formData.getAll(key).map(String).includes(String(index));
}

function deliveryRuleScope(value: string): DeliveryRuleScope {
  if (value === "barangay" || value === "city") return value;
  return "province";
}

export function parseDeliverySettingsForm(formData: FormData): DeliverySettings {
  const scopes = formStrings(formData, "ruleScope");
  const regions = formStrings(formData, "ruleRegion");
  const provinces = formStrings(formData, "ruleProvince");
  const cities = formStrings(formData, "ruleCity");
  const barangays = formStrings(formData, "ruleBarangay");
  const amounts = formStrings(formData, "ruleAmount");
  const ids = formStrings(formData, "ruleId");

  const rules: DeliveryFeeRule[] = scopes
    .map((scope, index) => ({
      id:
        ids[index] ||
        normalizeSlug(
          [scope, regions[index], provinces[index], cities[index], barangays[index]]
            .filter(Boolean)
            .join("-"),
        ),
      scope: deliveryRuleScope(scope),
      region: regions[index] ?? "",
      province: provinces[index] ?? "",
      city: cities[index] ?? "",
      barangay: barangays[index] ?? "",
      amount: formNumber(amounts[index] ?? ""),
      active: indexedActive(formData, "ruleActive", index),
      sortOrder: index + 1,
    }))
    .filter((rule) => Boolean(rule.id && rule.region && rule.province));

  return deliverySettingsSchema.parse({
    defaultDeliveryFee: formNumber(String(formData.get("defaultDeliveryFee") ?? "")),
    pickupLabel: String(formData.get("pickupLabel") ?? "Free pickup").trim(),
    pickupAddress: String(formData.get("pickupAddress") ?? "").trim(),
    regionalFees: {
      mindanao: {
        baseFee: formNumber(String(formData.get("mindanaoBaseFee") ?? "")),
        markup: formNumber(String(formData.get("mindanaoMarkup") ?? "")),
      },
      visayas: {
        baseFee: formNumber(String(formData.get("visayasBaseFee") ?? "")),
        markup: formNumber(String(formData.get("visayasMarkup") ?? "")),
      },
      luzon: {
        baseFee: formNumber(String(formData.get("luzonBaseFee") ?? "")),
        markup: formNumber(String(formData.get("luzonMarkup") ?? "")),
      },
    },
    rules,
  });
}
