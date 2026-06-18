import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedAdminEmail } from "../lib/admin-auth";

test("allows only the configured admin email, case-insensitively", () => {
  assert.equal(
    isAllowedAdminEmail(" ReJestHM@gmail.com ", "rejesthm@gmail.com"),
    true,
  );
  assert.equal(
    isAllowedAdminEmail("someone@example.com", "rejesthm@gmail.com"),
    false,
  );
  assert.equal(isAllowedAdminEmail("", "rejesthm@gmail.com"), false);
});
