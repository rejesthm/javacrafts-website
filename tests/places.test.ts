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
