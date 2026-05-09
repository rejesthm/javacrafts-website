import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GHL_SOURCE,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(5, "Phone is required").max(50),
  messenger: z.string().trim().max(200).optional().default(""),
  country: z.literal("Philippines").default("Philippines"),
  houseStreet: z.string().trim().min(1, "House and street are required").max(300),
  barangay: z.string().trim().min(1, "Barangay is required").max(200),
  postalCode: z.string().trim().min(1, "Postal code is required").max(30),
  city: z.string().trim().min(1, "City is required").max(120),
  region: z.string().trim().min(1, "Region is required").max(120),
  saveForNextTime: z.string().optional(),
  pageSlug: z.string().max(120).optional(),
  offer: z.string().max(500).optional(),
  total: z.coerce.number().nonnegative(),
});

const cartItemSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1).max(120),
  sizeId: z.enum(["s", "m", "l"]),
  sizeLabel: z.string().min(1).max(10),
  dimensions: z.string().min(1).max(50),
  price: z.number().nonnegative(),
  customText: z.string().trim().min(1).max(120),
  photo: z.object({
    dataUrl: z.string().min(1),
    name: z.string().min(1).max(255),
    type: z.string().min(1).max(80),
    size: z.number().nonnegative(),
  }),
  createdAt: z.string().min(1),
});

const cartSchema = z.array(cartItemSchema).min(1, "Cart is empty");

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function dataUrlToPhotoPayload(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { mimeType: "", base64: "" };

  return {
    mimeType: match[1]!,
    base64: match[2]!,
  };
}

export async function POST(request: Request) {
  const webhookUrl = process.env.NEXT_PUBLIC_GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Server is missing webhook configuration." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const leadParsed = leadSchema.safeParse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    phone: getFormString(formData, "phone"),
    messenger: getFormString(formData, "messenger"),
    country: getFormString(formData, "country") || "Philippines",
    houseStreet: getFormString(formData, "houseStreet"),
    barangay: getFormString(formData, "barangay"),
    postalCode: getFormString(formData, "postalCode"),
    city: getFormString(formData, "city"),
    region: getFormString(formData, "region"),
    saveForNextTime: getFormString(formData, "saveForNextTime"),
    pageSlug: getFormString(formData, "pageSlug"),
    offer: getFormString(formData, "offer"),
    total: getFormString(formData, "total"),
  });

  if (!leadParsed.success) {
    const msg = leadParsed.error.issues[0]?.message ?? "Invalid lead details";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let cartJson: unknown;
  try {
    cartJson = JSON.parse(getFormString(formData, "cart"));
  } catch {
    return NextResponse.json({ error: "Invalid cart details." }, { status: 400 });
  }

  const cartParsed = cartSchema.safeParse(cartJson);
  if (!cartParsed.success) {
    const msg = cartParsed.error.issues[0]?.message ?? "Invalid cart details";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const lead = leadParsed.data;
  const cart = cartParsed.data;
  const pageSlug = lead.pageSlug || GHL_PAGE_SLUG_HOME;
  const offer = lead.offer || OFFER;
  const { firstName, lastName } = splitName(lead.name);

  const items = cart.map((item, index) => {
    const photo = dataUrlToPhotoPayload(item.photo.dataUrl);
    return {
      lineNumber: index + 1,
      id: item.id,
      productName: item.productName,
      size: item.sizeLabel,
      dimensions: item.dimensions,
      price: item.price,
      customText: item.customText,
      photo: {
        fileName: item.photo.name,
        fileType: item.photo.type || photo.mimeType,
        fileSize: item.photo.size,
        mimeType: photo.mimeType || item.photo.type,
        base64: photo.base64,
      },
    };
  });

  const payload = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    firstName,
    lastName,
    messenger: lead.messenger,
    address: {
      country: lead.country,
      houseStreet: lead.houseStreet,
      barangay: lead.barangay,
      postalCode: lead.postalCode,
      city: lead.city,
      region: lead.region,
    },
    order: {
      items,
      itemCount: items.length,
      total: lead.total,
      currency: "PHP",
    },
    source: GHL_SOURCE,
    pageSlug,
    offer,
    businessCategory: BUSINESS_CATEGORY,
    goal: GOAL_TAG,
    saveForNextTime: lead.saveForNextTime === "true",
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
