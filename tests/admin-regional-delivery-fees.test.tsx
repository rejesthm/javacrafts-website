import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AdminRegionalDeliveryFees } from "../components/admin-regional-delivery-fees";

test("renders all regional fee inputs with effective totals", () => {
  const markup = renderToStaticMarkup(
    <AdminRegionalDeliveryFees
      initialFees={{
        mindanao: { baseFee: 85, markup: 10 },
        visayas: { baseFee: 105, markup: 20 },
        luzon: { baseFee: 135, markup: 30 },
      }}
    />,
  );

  for (const [group, baseFee, regionalMarkup, effectiveFee] of [
    ["mindanao", "85", "10", "P95"],
    ["visayas", "105", "20", "P125"],
    ["luzon", "135", "30", "P165"],
  ] as const) {
    assert.match(markup, new RegExp(`name="${group}BaseFee"[^>]*value="${baseFee}"`));
    assert.match(markup, new RegExp(`name="${group}Markup"[^>]*value="${regionalMarkup}"`));
    assert.match(markup, new RegExp(`>${effectiveFee}</output>`));
  }

  assert.match(markup, /for="mindanaoBaseFee"/);
  assert.match(markup, /for="visayasMarkup"/);
  assert.match(markup, /for="luzonMarkup"/);
});
