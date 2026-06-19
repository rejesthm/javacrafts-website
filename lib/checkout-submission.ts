import { z } from "zod";

import type { OrderStatus } from "@/lib/admin-auth";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GHL_SOURCE,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";
import { createPendingQrPayment, type OrderPayment } from "@/lib/paymongo";

const PH_MOBILE = /^(\+?63|0)9\d{9}$/;

export class CheckoutSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutSubmissionError";
  }
}

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .max(50)
    .refine((v) => PH_MOBILE.test(v.replace(/[\s-]/g, "")), {
      message: "Enter a valid PH mobile number (e.g. 0917 123 4567).",
    }),
  messenger: z.string().trim().max(200).optional().default(""),
  country: z.literal("Philippines").default("Philippines"),
  houseStreet: z.string().trim().min(1, "House and street are required").max(300),
  barangay: z.string().trim().min(1, "Barangay is required").max(200),
  postalCode: z
    .string()
    .trim()
    .refine((v) => /^\d{4}$/.test(v), {
      message: "Postal code must be 4 digits.",
    }),
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

export type CheckoutCartItem = z.infer<typeof cartItemSchema>;

export type CheckoutSubmission = {
  lead: {
    name: string;
    email: string;
    phone: string;
    messenger: string;
    address: {
      country: "Philippines";
      houseStreet: string;
      barangay: string;
      postalCode: string;
      city: string;
      region: string;
    };
  };
  cart: CheckoutCartItem[];
  total: number;
  saveForNextTime: boolean;
  pageSlug: string;
  offer: string;
};

export type OrderRecord = {
  orderId: string;
  status: OrderStatus;
  submittedAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    messenger: string;
  };
  address: CheckoutSubmission["lead"]["address"];
  order: {
    items: Array<{
      lineNumber: number;
      id: string;
      productName: string;
      sizeId: CheckoutCartItem["sizeId"];
      sizeLabel: string;
      dimensions: string;
      price: number;
      customText: string;
      createdAt: string;
      photo: {
        fileName: string;
        fileType: string;
        fileSize: number;
        storagePath: string;
      };
    }>;
    itemCount: number;
    total: number;
    currency: "PHP";
  };
  source: {
    pageSlug: string;
    offer: string;
    businessCategory: string;
    goal: string;
    saveForNextTime: boolean;
  };
  payment: OrderPayment;
};

export type PhotoUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

export type GhlSummaryItem = {
  productName: string;
  size?: string;
  customText?: string;
};

export function buildGhlProductSummary(items: readonly GhlSummaryItem[]) {
  return items
    .map((item) => {
      const size = item.size?.trim();
      return `1x ${item.productName}${size ? ` (${size})` : ""}`;
    })
    .join(", ");
}

export function buildGhlCustomTextSummary(
  items: readonly Pick<GhlSummaryItem, "customText">[],
) {
  return items
    .map((item) => item.customText?.trim())
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export function buildGhlShippingAddress(
  address: CheckoutSubmission["lead"]["address"],
) {
  return {
    line1: address.houseStreet,
    line2: address.barangay,
    city: address.city,
    state: address.region,
    postalCode: address.postalCode,
    country: "PH" as const,
  };
}

export function buildGhlFullAddress(
  address: CheckoutSubmission["lead"]["address"],
) {
  return [
    address.houseStreet,
    address.barangay,
    address.city,
    address.region,
    address.postalCode,
    "PH",
  ]
    .filter(Boolean)
    .join(", ");
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}

export function parseCheckoutFormData(formData: FormData): CheckoutSubmission {
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
    throw new CheckoutSubmissionError(msg);
  }

  let cartJson: unknown;
  try {
    cartJson = JSON.parse(getFormString(formData, "cart"));
  } catch {
    throw new CheckoutSubmissionError("Invalid cart details.");
  }

  const cartParsed = cartSchema.safeParse(cartJson);
  if (!cartParsed.success) {
    const msg = cartParsed.error.issues[0]?.message ?? "Invalid cart details";
    throw new CheckoutSubmissionError(msg);
  }

  const lead = leadParsed.data;
  return {
    lead: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      messenger: lead.messenger,
      address: {
        country: lead.country,
        houseStreet: lead.houseStreet,
        barangay: lead.barangay,
        postalCode: lead.postalCode,
        city: lead.city,
        region: lead.region,
      },
    },
    cart: cartParsed.data,
    total: lead.total,
    saveForNextTime: lead.saveForNextTime === "true",
    pageSlug: lead.pageSlug || GHL_PAGE_SLUG_HOME,
    offer: lead.offer || OFFER,
  };
}

function extensionForContentType(contentType: string) {
  switch (contentType.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export function dataUrlToUpload(
  dataUrl: string,
  _fileName: string,
  fallbackContentType: string,
): PhotoUpload {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new CheckoutSubmissionError("Invalid photo data.");

  const contentType = match[1] || fallbackContentType || "application/octet-stream";
  return {
    buffer: Buffer.from(match[2]!, "base64"),
    contentType,
    extension: extensionForContentType(contentType),
  };
}

function dataUrlToPhotoPayload(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { mimeType: "", base64: "" };

  return {
    mimeType: match[1]!,
    base64: match[2]!,
  };
}

export function buildCheckoutGhlPayload({
  orderId,
  submission,
  submittedAt,
}: {
  orderId: string;
  submission: CheckoutSubmission;
  submittedAt: string;
}) {
  const { firstName, lastName } = splitName(submission.lead.name);
  const summaryItems = submission.cart.map((item) => ({
    productName: item.productName,
    size: item.sizeLabel,
    customText: item.customText,
  }));
  const items = submission.cart.map((item, index) => {
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

  return {
    orderId,
    submittedAt,
    name: submission.lead.name,
    email: submission.lead.email,
    phone: submission.lead.phone,
    firstName,
    lastName,
    customer: {
      name: submission.lead.name,
      email: submission.lead.email,
      phone: submission.lead.phone,
      firstName,
      lastName,
    },
    messenger: submission.lead.messenger,
    address: {
      ...submission.lead.address,
      full: buildGhlFullAddress(submission.lead.address),
    },
    shippingAddress: buildGhlShippingAddress(submission.lead.address),
    order: {
      items,
      itemCount: items.length,
      total: submission.total,
      currency: "PHP" as const,
    },
    productSummary: buildGhlProductSummary(summaryItems),
    customText: buildGhlCustomTextSummary(summaryItems),
    source: GHL_SOURCE,
    pageSlug: submission.pageSlug,
    offer: submission.offer,
    businessCategory: BUSINESS_CATEGORY,
    goal: GOAL_TAG,
    saveForNextTime: submission.saveForNextTime,
  };
}

export function buildOrderRecord({
  orderId,
  submission,
  submittedAt,
  photoPaths,
}: {
  orderId: string;
  submission: CheckoutSubmission;
  submittedAt: string;
  photoPaths: string[];
}): OrderRecord {
  if (photoPaths.length !== submission.cart.length) {
    throw new Error("Photo path count must match cart item count.");
  }

  return {
    orderId,
    status: "new",
    submittedAt,
    updatedAt: submittedAt,
    customer: {
      name: submission.lead.name,
      email: submission.lead.email,
      phone: submission.lead.phone,
      messenger: submission.lead.messenger,
    },
    address: submission.lead.address,
    order: {
      items: submission.cart.map((item, index) => ({
        lineNumber: index + 1,
        id: item.id,
        productName: item.productName,
        sizeId: item.sizeId,
        sizeLabel: item.sizeLabel,
        dimensions: item.dimensions,
        price: item.price,
        customText: item.customText,
        createdAt: item.createdAt,
        photo: {
          fileName: item.photo.name,
          fileType: item.photo.type,
          fileSize: item.photo.size,
          storagePath: photoPaths[index]!,
        },
      })),
      itemCount: submission.cart.length,
      total: submission.total,
      currency: "PHP",
    },
    source: {
      pageSlug: submission.pageSlug,
      offer: submission.offer,
      businessCategory: BUSINESS_CATEGORY,
      goal: GOAL_TAG,
      saveForNextTime: submission.saveForNextTime,
    },
    payment: createPendingQrPayment(submission.total),
  };
}
