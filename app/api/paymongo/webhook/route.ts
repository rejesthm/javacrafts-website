import { NextResponse } from "next/server";

import { FirebaseConfigError } from "@/lib/firebase/admin";
import { applyPaymongoWebhookEvent } from "@/lib/firebase/orders";
import {
  normalizePaymongoWebhookEvent,
  verifyPaymongoWebhookSignature,
} from "@/lib/paymongo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[paymongo-webhook] PAYMONGO_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");
  if (!verifyPaymongoWebhookSignature(rawBody, secret, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  let event;
  try {
    event = normalizePaymongoWebhookEvent(payload);
  } catch {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const result = await applyPaymongoWebhookEvent(event);
    return NextResponse.json({
      ok: true,
      applied: result.ok,
      duplicate: result.ok ? result.duplicate : false,
      reason: result.ok ? undefined : result.reason,
    });
  } catch (err) {
    if (err instanceof FirebaseConfigError) {
      console.error("[paymongo-webhook] Firebase is not configured:", err.message);
      return NextResponse.json(
        { error: "Webhook storage is not configured." },
        { status: 503 },
      );
    }
    console.error("[paymongo-webhook] Could not apply event:", err);
    return NextResponse.json(
      { error: "Could not apply webhook event." },
      { status: 500 },
    );
  }
}
