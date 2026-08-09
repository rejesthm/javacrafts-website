# Regional Delivery Fees Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable Luzon, Visayas, and Mindanao base delivery fees and flat-peso markups that apply to all classified checkout addresses unless a more specific delivery rule matches.

**Architecture:** Canonical PSGC region codes map validated checkout addresses to an `IslandGroup`. The existing delivery settings document stores one base/markup pair per group, and `quoteDelivery` evaluates specific barangay/city/province rules before the regional effective fee. A tested pure form parser feeds the existing authenticated Server Action, while a small client component provides constrained inputs and live effective-fee previews in the admin UI.

**Tech Stack:** Next.js 16.2 App Router and Server Actions, React 19, TypeScript 5, Zod 4, Firebase Admin/Firestore, Node test runner with `tsx`

## Global Constraints

- Initial base fees are exactly Mindanao `85`, Visayas `105`, and Luzon `135` Philippine pesos.
- Initial markups are exactly `0` Philippine pesos.
- Markup is a flat peso amount, and effective fee is `baseFee + markup`.
- Delivery priority is barangay rule, city rule, province rule, island group, then nationwide default.
- Existing province/city/barangay rules and pickup behavior must remain intact.
- Luzon maps PSGC region codes `01`, `02`, `03`, `04`, `05`, `13`, `14`, and `17`; Visayas maps `06`, `07`, `08`, and `18`; Mindanao maps `09`, `10`, `11`, `12`, `16`, and `19` using their full ten-digit region codes.
- Base fees and markups are whole numbers from `0` through `500000`.
- Old Firestore delivery documents without `regionalFees` must parse with the agreed defaults; no destructive migration is allowed.
- Unknown region codes use the nationwide default and are never classified by guessed text labels.
- The admin UI must expose all six values and show the effective fee; checkout shows only the final delivery fee.
- Follow the repository's Next.js 16 documentation in `node_modules/next/dist/docs/01-app/02-guides/forms.md` and `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`.

---

## File Structure

- Modify `lib/places.ts`: own canonical PSGC island-group classification.
- Modify `lib/catalog.ts`: own delivery regional types, defaults, schema, and quote precedence.
- Create `lib/delivery-settings-form.ts`: own pure parsing of the admin Delivery `FormData` into validated settings input.
- Modify `app/admin/actions.ts`: authenticate, call the pure parser, persist, and revalidate.
- Create `components/admin-regional-delivery-fees.tsx`: own the six interactive numeric inputs and live summaries.
- Modify `app/admin/delivery/page.tsx`: place the regional editor within the existing Delivery form.
- Modify `tests/catalog.test.ts`: verify defaults, migration parsing, regional pricing, and override precedence.
- Create `tests/places.test.ts`: verify all 18 PSGC region-code classifications and unknown fallback.
- Create `tests/delivery-settings-form.test.ts`: verify all six values and specific rules survive form parsing.

### Task 1: Canonical Island-Group Classification

**Files:**
- Modify: `lib/places.ts`
- Create: `tests/places.test.ts`

**Interfaces:**
- Consumes: canonical ten-digit PSGC region codes already returned by `validatePsgcAddress`
- Produces: `type IslandGroup = "mindanao" | "visayas" | "luzon"` and `islandGroupForRegionCode(regionCode: string): IslandGroup | null`

- [ ] **Step 1: Write the failing region-classification test**

Create `tests/places.test.ts` with explicit coverage of every current region:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { islandGroupForRegionCode } from "../lib/places";

test("classifies every Q1 2026 PSGC region into its island group", () => {
  const expected = {
    "0100000000": "luzon",
    "0200000000": "luzon",
    "0300000000": "luzon",
    "0400000000": "luzon",
    "0500000000": "luzon",
    "0600000000": "visayas",
    "0700000000": "visayas",
    "0800000000": "visayas",
    "0900000000": "mindanao",
    "1000000000": "mindanao",
    "1100000000": "mindanao",
    "1200000000": "mindanao",
    "1300000000": "luzon",
    "1400000000": "luzon",
    "1600000000": "mindanao",
    "1700000000": "luzon",
    "1800000000": "visayas",
    "1900000000": "mindanao",
  } as const;

  for (const [regionCode, group] of Object.entries(expected)) {
    assert.equal(islandGroupForRegionCode(regionCode), group);
  }
});

test("does not guess an island group for unknown or malformed codes", () => {
  assert.equal(islandGroupForRegionCode(""), null);
  assert.equal(islandGroupForRegionCode("Region XI (Davao Region)"), null);
  assert.equal(islandGroupForRegionCode("9900000000"), null);
});
```

- [ ] **Step 2: Run the new test and confirm the missing export fails**

Run:

```bash
npx tsx --test tests/places.test.ts
```

Expected: FAIL because `islandGroupForRegionCode` is not exported.

- [ ] **Step 3: Implement the explicit canonical map**

Add near the PSGC types in `lib/places.ts`:

```ts
export type IslandGroup = "mindanao" | "visayas" | "luzon";

const ISLAND_GROUP_BY_REGION_CODE: Readonly<Record<string, IslandGroup>> = {
  "0100000000": "luzon",
  "0200000000": "luzon",
  "0300000000": "luzon",
  "0400000000": "luzon",
  "0500000000": "luzon",
  "0600000000": "visayas",
  "0700000000": "visayas",
  "0800000000": "visayas",
  "0900000000": "mindanao",
  "1000000000": "mindanao",
  "1100000000": "mindanao",
  "1200000000": "mindanao",
  "1300000000": "luzon",
  "1400000000": "luzon",
  "1600000000": "mindanao",
  "1700000000": "luzon",
  "1800000000": "visayas",
  "1900000000": "mindanao",
};

export function islandGroupForRegionCode(regionCode: string): IslandGroup | null {
  return ISLAND_GROUP_BY_REGION_CODE[regionCode.trim()] ?? null;
}
```

- [ ] **Step 4: Run the focused classification test**

Run:

```bash
npx tsx --test tests/places.test.ts
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Commit the classifier**

```bash
git add lib/places.ts tests/places.test.ts
git commit -m "feat: classify PSGC island groups"
```

### Task 2: Regional Settings Schema and Quote Precedence

**Files:**
- Modify: `lib/catalog.ts`
- Modify: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: `IslandGroup` and `islandGroupForRegionCode` from `lib/places.ts`
- Produces: `RegionalDeliveryFee`, `RegionalDeliveryFees`, `DEFAULT_REGIONAL_DELIVERY_FEES`, backward-compatible `deliverySettingsSchema`, and regional `DeliveryQuote` results

- [ ] **Step 1: Add failing schema-migration and regional-pricing tests**

Extend `tests/catalog.test.ts` to assert exact defaults and calculation:

```ts
import {
  DEFAULT_DELIVERY_SETTINGS,
  deliverySettingsSchema,
  quoteDelivery,
} from "../lib/catalog";

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
```

Update the existing precedence test's settings with `regionalFees`, preserve the three specific rules, and assert the unmatched known Visayas address returns the Visayas fee while all three specific matches remain unchanged.

- [ ] **Step 2: Run the catalog tests and confirm type/schema failures**

Run:

```bash
npx tsx --test tests/catalog.test.ts
```

Expected: FAIL because `regionalFees`, `regionCode`, and regional quote scopes do not exist.

- [ ] **Step 3: Add regional types, defaults, and backward-compatible schema**

In `lib/catalog.ts`, import `IslandGroup` and `islandGroupForRegionCode`, then add:

```ts
export type RegionalDeliveryFee = {
  baseFee: number;
  markup: number;
};

export type RegionalDeliveryFees = Record<IslandGroup, RegionalDeliveryFee>;

export const DEFAULT_REGIONAL_DELIVERY_FEES: RegionalDeliveryFees = {
  mindanao: { baseFee: 85, markup: 0 },
  visayas: { baseFee: 105, markup: 0 },
  luzon: { baseFee: 135, markup: 0 },
};
```

Add `regionalFees: RegionalDeliveryFees` to `DeliverySettings`, `regionCode?: string` to `DeliveryAddressInput`, and `IslandGroup` to `DeliveryQuote["scope"]`. Add the defaults to `DEFAULT_DELIVERY_SETTINGS`.

Define one reusable amount schema and the nested default:

```ts
const deliveryAmountSchema = z.coerce.number().int().min(0).max(500000);

const regionalDeliveryFeeSchema = z.object({
  baseFee: deliveryAmountSchema,
  markup: deliveryAmountSchema,
});

const regionalDeliveryFeesSchema = z.object({
  mindanao: regionalDeliveryFeeSchema,
  visayas: regionalDeliveryFeeSchema,
  luzon: regionalDeliveryFeeSchema,
});
```

Use `regionalDeliveryFeesSchema.default(() => structuredClone(DEFAULT_REGIONAL_DELIVERY_FEES))` for `deliverySettingsSchema.regionalFees` and reuse `deliveryAmountSchema` for existing delivery amounts.

- [ ] **Step 4: Implement regional fallback after specific rules**

In `quoteDelivery`, retain the existing match search unchanged. Immediately after the `if (match)` return, add:

```ts
  const islandGroup = islandGroupForRegionCode(address.regionCode ?? "");
  if (islandGroup) {
    const regionalFee = settings.regionalFees[islandGroup];
    const label = `${islandGroup[0]!.toUpperCase()}${islandGroup.slice(1)} delivery`;
    return {
      fulfillmentType,
      fee: regionalFee.baseFee + regionalFee.markup,
      ruleId: null,
      scope: islandGroup,
      label,
    };
  }
```

Leave the existing nationwide-default return after this block.

- [ ] **Step 5: Run focused and full domain tests**

Run:

```bash
npx tsx --test tests/catalog.test.ts tests/checkout-submission.test.ts tests/places.test.ts
```

Expected: all focused tests pass, including existing specific-rule and pickup assertions.

- [ ] **Step 6: Commit schema and pricing behavior**

```bash
git add lib/catalog.ts tests/catalog.test.ts
git commit -m "feat: add regional delivery pricing"
```

### Task 3: Tested Admin Delivery Form Parsing

**Files:**
- Create: `lib/delivery-settings-form.ts`
- Create: `tests/delivery-settings-form.test.ts`
- Modify: `app/admin/actions.ts`

**Interfaces:**
- Consumes: the existing Delivery form field names plus `mindanaoBaseFee`, `mindanaoMarkup`, `visayasBaseFee`, `visayasMarkup`, `luzonBaseFee`, and `luzonMarkup`
- Produces: `parseDeliverySettingsForm(formData: FormData): DeliverySettings`, used only after `requireAdminSession()` succeeds

- [ ] **Step 1: Write a failing parser test with regional values and a specific rule**

Create `tests/delivery-settings-form.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { parseDeliverySettingsForm } from "../lib/delivery-settings-form";

test("parses all regional fees without losing specific rules", () => {
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
  const formData = new FormData();
  formData.set("defaultDeliveryFee", "180");
  formData.set("pickupLabel", "Free pickup");
  formData.set("pickupAddress", "Maniki, Kapalong, Davao del Norte");
  formData.set("mindanaoBaseFee", "-1");
  formData.set("mindanaoMarkup", "0");
  formData.set("visayasBaseFee", "105");
  formData.set("visayasMarkup", "0");
  formData.set("luzonBaseFee", "135");
  formData.set("luzonMarkup", "0");

  assert.throws(() => parseDeliverySettingsForm(formData));
});
```

- [ ] **Step 2: Run the parser test and confirm the module is missing**

Run:

```bash
npx tsx --test tests/delivery-settings-form.test.ts
```

Expected: FAIL because `lib/delivery-settings-form.ts` does not exist.

- [ ] **Step 3: Extract the pure parser from the Server Action**

Create `lib/delivery-settings-form.ts`. Move the delivery-specific string, numeric, checkbox, and scope parsing from `app/admin/actions.ts` into this file. Build the regional object and validate the complete result:

```ts
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

  const settings = {
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
  };
  return deliverySettingsSchema.parse(settings);
}
```

Ensure `formNumber` returns `Number.NaN` for blank or non-numeric regional inputs so Zod rejects them; do not silently convert invalid submitted regional values to zero.

- [ ] **Step 4: Make the authenticated action use the tested parser**

Replace the delivery parsing body in `saveDeliveryAction` with:

```ts
export async function saveDeliveryAction(formData: FormData) {
  await requireAdminSession();
  await saveDeliverySettings(parseDeliverySettingsForm(formData));
  revalidatePath("/checkout");
  revalidatePath("/admin/delivery");
}
```

Remove delivery-only imports and helpers from `app/admin/actions.ts` only when no other action uses them. Keep the authorization check inside the Server Action as required by the installed Next.js guide.

- [ ] **Step 5: Run parser and existing tests**

Run:

```bash
npx tsx --test tests/delivery-settings-form.test.ts tests/catalog.test.ts tests/checkout-submission.test.ts
```

Expected: all tests pass and the existing rule remains present in the parser result.

- [ ] **Step 6: Commit the form boundary**

```bash
git add lib/delivery-settings-form.ts tests/delivery-settings-form.test.ts app/admin/actions.ts
git commit -m "feat: parse regional delivery settings"
```

### Task 4: Admin Regional Fee Web UI

**Files:**
- Create: `components/admin-regional-delivery-fees.tsx`
- Modify: `app/admin/delivery/page.tsx`

**Interfaces:**
- Consumes: `RegionalDeliveryFees` from `lib/catalog.ts` as an `initialFees` prop
- Produces: six named form inputs consumed by `parseDeliverySettingsForm` and three live effective-fee summaries

- [ ] **Step 1: Create the focused client editor component**

Create `components/admin-regional-delivery-fees.tsx` with `"use client"`, local string state initialized from `initialFees`, and a fixed display order of Mindanao, Visayas, Luzon:

```tsx
type EditableRegionalFee = { baseFee: string; markup: string };
type EditableRegionalFees = Record<IslandGroup, EditableRegionalFee>;

const [fees, setFees] = useState<EditableRegionalFees>(() => ({
  mindanao: {
    baseFee: String(initialFees.mindanao.baseFee),
    markup: String(initialFees.mindanao.markup),
  },
  visayas: {
    baseFee: String(initialFees.visayas.baseFee),
    markup: String(initialFees.visayas.markup),
  },
  luzon: {
    baseFee: String(initialFees.luzon.baseFee),
    markup: String(initialFees.luzon.markup),
  },
}));

function updateFee(group: IslandGroup, field: keyof EditableRegionalFee, value: string) {
  if (value && !/^\d+$/.test(value)) return;
  setFees((current) => ({
    ...current,
    [group]: { ...current[group], [field]: value },
  }));
}
```

Each input must use:

```tsx
<input
  type="number"
  min={0}
  max={500000}
  step={1}
  required
  name={`${group}BaseFee`}
  value={fees[group].baseFee}
  onChange={(event) => updateFee(group, "baseFee", event.currentTarget.value)}
/>
```

Use the same shape for `${group}Markup`. Preserve an empty display while editing and rely on `required` plus server-side Zod validation as the final boundary. Render an `output` or read-only text region with `aria-live="polite"` showing:

```tsx
formatPeso(numericBaseFee + numericMarkup)
```

Include concise explanatory copy: `Applies to every address in this group unless a province, city, or barangay rule overrides it.` Reuse the existing cream, gold, border, and typography tokens; do not introduce a new visual system.

- [ ] **Step 2: Add the editor to the existing Delivery form**

In `app/admin/delivery/page.tsx`, import the component and insert this section between Global Defaults and Fee Rules:

```tsx
<SectionCard
  icon={MapPinned}
  title="Regional Delivery Fees"
  description="Base fee plus markup applies across each island group. More specific active rules still take priority."
>
  <AdminRegionalDeliveryFees initialFees={settings.regionalFees} />
</SectionCard>
```

Keep the component inside the existing `<form action={saveDeliveryAction}>` so its named inputs reach the authenticated Server Action.

- [ ] **Step 3: Run lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0 with no TypeScript, React, or Next.js errors.

- [ ] **Step 4: Run the complete automated suite**

Run:

```bash
npm test
```

Expected: all existing and new tests pass with 0 failures.

- [ ] **Step 5: Verify the admin form manually**

Run:

```bash
npm run dev
```

Open `/admin/delivery` in the local authenticated browser session and verify:

1. Mindanao shows base `85`, Visayas `105`, and Luzon `135` when using fallback settings.
2. Changing any markup updates only that group's effective-fee preview.
3. The existing Fee Rules table remains visible and editable.
4. Saving and refreshing preserves all six regional values.
5. Checkout addresses in Davao, Cebu, and NCR quote the saved Mindanao, Visayas, and Luzon effective fees when no specific rule matches.
6. Kapalong and Davao del Norte continue using their existing city/province overrides.

- [ ] **Step 6: Commit the admin UI**

```bash
git add components/admin-regional-delivery-fees.tsx app/admin/delivery/page.tsx
git commit -m "feat: edit regional delivery fees"
```

### Task 5: Final Persistence and Regression Verification

**Files:**
- Verify only: `lib/firebase/site-content.ts`
- Verify only: `firestore.rules`
- Verify only: all files changed in Tasks 1–4

**Interfaces:**
- Consumes: the validated `DeliverySettings` produced by the admin form
- Produces: a complete `siteSettings/delivery` document readable by checkout and order repricing

- [ ] **Step 1: Confirm persistence requires no extra migration code**

Inspect `saveDeliverySettings` and verify it validates the complete settings object and writes it to `siteSettings/delivery`. Inspect `firestore.rules` and verify browser clients cannot bypass the authenticated server path to write site settings. Do not change either file unless verification exposes a concrete mismatch.

- [ ] **Step 2: Run fresh full verification**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: tests, lint, and build exit 0; `git diff --check` reports no whitespace errors; status contains only intentional work if the final commit has not yet been created.

- [ ] **Step 3: Review the implementation against the approved specification**

Confirm each requirement directly:

```text
[ ] 85/105/135 defaults and zero markups
[ ] flat-peso base + markup calculation
[ ] all 18 PSGC regions classified explicitly
[ ] specific rules override regional fees
[ ] unknown regions use nationwide default
[ ] old Firestore documents parse without migration
[ ] all six values editable in admin Web UI
[ ] saved values persist in siteSettings/delivery
[ ] checkout displays one final delivery fee
```

Expected: every item is supported by a test, build result, or manual browser observation.

- [ ] **Step 4: Commit any final intentional verification fixes**

If Step 2 or Step 3 required a code correction, stage only the feature's reviewed files and commit:

```bash
git add lib/places.ts lib/catalog.ts lib/delivery-settings-form.ts app/admin/actions.ts components/admin-regional-delivery-fees.tsx app/admin/delivery/page.tsx tests/places.test.ts tests/catalog.test.ts tests/delivery-settings-form.test.ts
git commit -m "fix: complete regional delivery fees"
```

If no correction was required, do not create an empty commit.
