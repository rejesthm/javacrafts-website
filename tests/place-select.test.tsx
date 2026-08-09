import assert from "node:assert/strict";
import test from "node:test";
import { Map } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

import { PlaceSelect } from "../components/place-select";

test("renders every option when a place already has a selected value", () => {
  const markup = renderToStaticMarkup(
    <PlaceSelect
      id="region"
      label="Region"
      icon={Map}
      value="Region XI (Davao Region)"
      options={[
        { code: "0700000000", label: "Region VII (Central Visayas)" },
        { code: "1100000000", label: "Region XI (Davao Region)" },
      ]}
      onChange={() => undefined}
    />,
  );

  assert.match(markup, /<select[^>]*id="region"[^>]*name="region"/);
  assert.match(
    markup,
    /<option value="0700000000">Region VII \(Central Visayas\)<\/option>/,
  );
  assert.match(
    markup,
    /<option value="1100000000" selected="">Region XI \(Davao Region\)<\/option>/,
  );
  assert.doesNotMatch(markup, /<datalist|list="region-options"/);
});
