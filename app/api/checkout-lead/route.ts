import { NextResponse } from "next/server";
import { z } from "zod";

import { FirebaseConfigError } from "@/lib/firebase/admin";
import { saveCheckoutLead } from "@/lib/firebase/orders";

export const runtime = "nodejs";

const cartItemSummarySchema = z.object({
  productName: z.string().trim().min(1).max(120),
  size: z.string().trim().max(20).optional().default(""),
  customText: z.string().trim().max(120).optional().default(""),
  price: z.number().nonnegative().optional(),
});

const checkoutLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required"),
  pageSlug: z.string().max(120).optional(),
  offer: z.string().max(500).optional(),
  cart: z
    .object({
      itemCount: z.number().int().nonnegative().max(999),
      total: z.number().nonnegative(),
      items: z.array(cartItemSummarySchema).max(50),
    })
    .optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const parsed = checkoutLeadSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid lead details";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const result = await saveCheckoutLead(parsed.data);
    if (!result.ghl.ok) {
      const status = result.ghl.skipped ? 503 : 502;
      const detail =
        result.ghl.reason === "missing_webhook"
          ? "GHL_WEBHOOK_URL is not configured."
          : `GHL webhook failed: ${result.ghl.reason}.`;
      console.error(`[checkout-lead] ${detail}`);
      return NextResponse.json(
        {
          error:
            "We couldn't send your details to our CRM just now. Please try again in a moment.",
          ghl: result.ghl,
        },
        { status },
      );
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof FirebaseConfigError) {
      console.error("[checkout-lead] Firebase is not configured:", err.message);
      return NextResponse.json(
        {
          error:
            "We couldn't save your details just now. Please try again in a moment.",
        },
        { status: 503 },
      );
    }

    console.error("[checkout-lead] Lead submission failed:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't save your details just now. Please try again in a moment.",
      },
      { status: 502 },
    );
  }
}
