import { NextResponse } from "next/server";
import { z } from "zod";

import { quoteDelivery } from "@/lib/catalog";
import { getDeliverySettings } from "@/lib/firebase/site-content";
import { validatePsgcAddress } from "@/lib/places";

export const runtime = "nodejs";

const quoteRequestSchema = z.object({
  fulfillmentType: z.enum(["delivery", "pickup"]),
  region: z.string().trim().default(""),
  regionCode: z.string().trim().default(""),
  province: z.string().trim().default(""),
  provinceCode: z.string().trim().default(""),
  city: z.string().trim().default(""),
  cityCode: z.string().trim().default(""),
  barangay: z.string().trim().default(""),
  barangayCode: z.string().trim().default(""),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote details." }, { status: 400 });
  }

  const settings = await getDeliverySettings();
  if (parsed.data.fulfillmentType === "pickup") {
    return NextResponse.json({
      quote: quoteDelivery({ settings, fulfillmentType: "pickup" }),
    });
  }

  const address = validatePsgcAddress(parsed.data);
  if (!address) {
    return NextResponse.json({
      quote: quoteDelivery({ settings, fulfillmentType: "delivery" }),
      incomplete: true,
    });
  }

  return NextResponse.json({
    quote: quoteDelivery({
      settings,
      fulfillmentType: "delivery",
      address,
    }),
  });
}
