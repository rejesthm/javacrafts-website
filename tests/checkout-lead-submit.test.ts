import assert from "node:assert/strict";
import test from "node:test";

import { submitCheckoutLead } from "../lib/checkout-lead-submit";

const payload = {
  name: "Maria Santos",
  email: "maria@example.com",
  pageSlug: "home",
  offer: "Test offer",
};

function response({
  ok,
  status,
  body,
}: {
  ok: boolean;
  status: number;
  body: unknown;
}) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

test("checkout lead submit throws when server does not confirm capture", async () => {
  await assert.rejects(
    submitCheckoutLead(payload, async () =>
      response({
        ok: false,
        status: 502,
        body: { error: "We couldn't send your details to our CRM." },
      }),
    ),
    /CRM/,
  );
});

test("checkout lead submit posts payload and resolves after confirmed capture", async () => {
  let sentBody = "";

  const result = await submitCheckoutLead(payload, async (_url, init) => {
    sentBody = String(init?.body ?? "");
    return response({
      ok: true,
      status: 200,
      body: { ok: true, leadId: "lead-123" },
    });
  });

  assert.deepEqual(result, { ok: true, leadId: "lead-123" });
  assert.equal(JSON.parse(sentBody).email, "maria@example.com");
});
