import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GHL_SOURCE,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(5, "Phone is required").max(50),
  pageSlug: z.string().max(120).optional(),
  offer: z.string().max(500).optional(),
});

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Forwards leads to GoHighLevel Inbound Webhook.
 * Map in GHL: email, name, phone, source, pageSlug, offer; tag goal "Sales & Conversions"
 * and category "Arts & Crafts & Handmade" as needed in your workflow.
 */
export async function POST(request: Request) {
  const webhookUrl = process.env.NEXT_PUBLIC_GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Server is missing webhook configuration." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, email, phone } = parsed.data;
  const pageSlug = parsed.data.pageSlug ?? GHL_PAGE_SLUG_HOME;
  const offer = parsed.data.offer ?? OFFER;
  const { firstName, lastName } = splitName(name);

  const payload = {
    name,
    email,
    phone,
    firstName,
    lastName,
    source: GHL_SOURCE,
    pageSlug,
    offer,
    businessCategory: BUSINESS_CATEGORY,
    goal: GOAL_TAG,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not reach CRM. Try again in a moment." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not reach CRM. Try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
