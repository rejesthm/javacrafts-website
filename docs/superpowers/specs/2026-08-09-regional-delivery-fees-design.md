# Regional Delivery Fees Design

## Goal

Add editable Luzon, Visayas, and Mindanao base delivery fees and flat-peso markups to the admin Delivery web UI. A single change to an island group's settings must apply to every checkout address classified into that group, while existing barangay, city, and province fee rules retain higher priority.

## Pricing Model

Delivery quotes use this priority order:

1. Active barangay-specific rule
2. Active city-specific rule
3. Active province-specific rule
4. Island-group effective fee
5. Nationwide default fee when the address cannot be classified

Each island-group effective fee is calculated as:

```text
effective fee = base fee + flat peso markup
```

Initial values are:

| Island group | Base fee | Markup | Initial effective fee |
| --- | ---: | ---: | ---: |
| Mindanao | ₱85 | ₱0 | ₱85 |
| Visayas | ₱105 | ₱0 | ₱105 |
| Luzon | ₱135 | ₱0 | ₱135 |

Base fees and markups are non-negative whole Philippine peso amounts. The same upper bound used by existing delivery amounts, ₱500,000 per input, applies.

## Geographic Classification

Classification uses the selected address's canonical PSGC region code, not free-text matching. The Q1 2026 PSGC regions map as follows:

### Luzon

- `0100000000` — Region I (Ilocos Region)
- `0200000000` — Region II (Cagayan Valley)
- `0300000000` — Region III (Central Luzon)
- `0400000000` — Region IV-A (CALABARZON)
- `0500000000` — Region V (Bicol Region)
- `1300000000` — National Capital Region (NCR)
- `1400000000` — Cordillera Administrative Region (CAR)
- `1700000000` — MIMAROPA Region

### Visayas

- `0600000000` — Region VI (Western Visayas)
- `0700000000` — Region VII (Central Visayas)
- `0800000000` — Region VIII (Eastern Visayas)
- `1800000000` — Negros Island Region (NIR)

### Mindanao

- `0900000000` — Region IX (Zamboanga Peninsula)
- `1000000000` — Region X (Northern Mindanao)
- `1100000000` — Region XI (Davao Region)
- `1200000000` — Region XII (SOCCSKSARGEN)
- `1600000000` — Region XIII (Caraga)
- `1900000000` — Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)

The server derives and validates the canonical address through the existing PSGC dataset. An unrecognized region does not guess an island group and instead uses the nationwide default.

## Data Model and Migration

The existing Firestore document `siteSettings/delivery` gains a `regionalFees` object:

```ts
type IslandGroup = "mindanao" | "visayas" | "luzon";

type RegionalDeliveryFee = {
  baseFee: number;
  markup: number;
};

type RegionalDeliveryFees = Record<IslandGroup, RegionalDeliveryFee>;
```

`DeliverySettings` stores `regionalFees` alongside `defaultDeliveryFee`, pickup fields, and specific rules. The schema supplies the agreed initial values when an older Firestore document lacks `regionalFees`, so deployment does not require a destructive migration. The normal admin save writes the complete validated settings document, including all six regional values and all existing rules.

The quote input includes `regionCode` so classification does not depend on region-label spelling. Existing specific rules continue matching their canonical address labels and are evaluated before the regional fallback.

## Admin Web UI

The admin Delivery page adds a **Regional Delivery Fees** section between Global Defaults and Fee Rules. It presents Mindanao, Visayas, and Luzon consistently, with:

- A labeled whole-peso base-fee input
- A labeled whole-peso markup input
- A read-only effective-fee summary showing base plus markup
- Short copy explaining that one saved value applies to every checkout address in that island group unless a more specific active rule matches

The inputs participate in the existing Delivery page form and Save action. The existing nationwide default, pickup settings, and specific fee-rule table remain available.

## Quote Behavior

For a validated delivery address, quote calculation first searches active specific rules using the existing specificity order. If none matches, it resolves the island group from `regionCode`, adds that group's base fee and markup, and returns the resulting amount with a regional scope and customer-facing label such as `Visayas delivery`.

Pickup remains free and unaffected. An incomplete or unrecognized delivery address retains the nationwide default fallback. Checkout continues to display a single final delivery fee; the markup is an administrative pricing component and is not shown as a separate customer charge.

## Validation and Error Handling

- Client inputs use `type="number"`, `min="0"`, `max="500000"`, and `step="1"` for whole, non-negative peso values.
- The server action parses all six fields and relies on the shared Zod delivery schema as the authoritative validation boundary.
- Each base fee and markup must be an integer from `0` through `500000`.
- An unknown PSGC region code cannot silently map by label; it falls back to the nationwide default.
- Existing Firestore documents missing the new object receive schema defaults on read.
- Invalid stored values or submitted values are rejected rather than producing a checkout quote from malformed settings.

## Testing

Automated tests cover:

- Every current PSGC region code maps to the agreed island group.
- Mindanao, Visayas, and Luzon quotes calculate base fee plus flat markup.
- Barangay, city, and province rules override the regional fee in that order.
- Pickup remains free.
- Unknown or missing classifications use the nationwide default.
- The delivery schema parses older documents without `regionalFees` using `85/0`, `105/0`, and `135/0` defaults.
- The admin form parser saves all six regional values without losing specific rules.

Relevant existing application tests and the production build must also pass before completion.
