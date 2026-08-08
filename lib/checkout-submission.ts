import { z } from "zod";

import type { OrderStatus } from "@/lib/admin-auth";
import {
  calculateLinePrice,
  quoteDelivery,
  type DeliveryQuote,
  type DeliverySettings,
  type EngravingProduct,
  type FulfillmentType,
} from "@/lib/catalog";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GHL_SOURCE,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";
import { createPendingQrPayment, type OrderPayment } from "@/lib/paymongo";
import { validatePsgcAddress } from "@/lib/places";

const PH_MOBILE = /^(\+?63|0)9\d{9}$/;

export const PICKUP_BILLING_ADDRESS = {
  country: "Philippines" as const,
  houseStreet: "Pickup at Java Crafts",
  barangay: "Maniki",
  barangayCode: "1102305021",
  city: "Kapalong",
  cityCode: "1102305000",
  province: "Davao del Norte",
  provinceCode: "1102300000",
  region: "Region XI (Davao Region)",
  regionCode: "1100000000",
  postalCode: "8113",
};

export class CheckoutSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutSubmissionError";
  }
}

export type CheckoutPricingSummary = Pick<
  CheckoutSubmission,
  "cart" | "delivery" | "itemSubtotal" | "total"
>;

export class CheckoutPriceChangedError extends CheckoutSubmissionError {
  constructor(public readonly summary: CheckoutPricingSummary) {
    super("Prices changed since this cart was prepared. Please review your order total and submit again.");
    this.name = "CheckoutPriceChangedError";
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
  fulfillmentType: z.enum(["delivery", "pickup"]).default("delivery"),
  country: z.literal("Philippines").default("Philippines"),
  houseStreet: z.string().trim().max(300).default(""),
  barangay: z.string().trim().max(200).default(""),
  barangayCode: z.string().trim().max(240).default(""),
  postalCode: z
    .string()
    .trim()
    .default(""),
  city: z.string().trim().max(120).default(""),
  cityCode: z.string().trim().max(240).default(""),
  province: z.string().trim().max(120).default(""),
  provinceCode: z.string().trim().max(240).default(""),
  region: z.string().trim().max(120).default(""),
  regionCode: z.string().trim().max(240).default(""),
  saveForNextTime: z.string().optional(),
  pageSlug: z.string().max(120).optional(),
  offer: z.string().max(500).optional(),
  total: z.coerce.number().nonnegative(),
}).superRefine((lead, ctx) => {
  if (lead.fulfillmentType === "pickup") return;

  if (!lead.houseStreet.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["houseStreet"],
      message: "House and street are required.",
    });
  }
  if (!lead.barangay.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["barangay"],
      message: "Barangay is required.",
    });
  }
  if (!lead.city.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["city"],
      message: "City or municipality is required.",
    });
  }
  if (!lead.province.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["province"],
      message: "Province is required.",
    });
  }
  if (!lead.region.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["region"],
      message: "Region is required.",
    });
  }
  if (!/^\d{4}$/.test(lead.postalCode.trim())) {
    ctx.addIssue({
      code: "custom",
      path: ["postalCode"],
      message: "Postal code must be 4 digits.",
    });
  }
});

const cartItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1).default("personalized-engraved-plaque"),
  productName: z.string().min(1).max(120),
  sizeId: z.string().min(1).max(80),
  sizeLabel: z.string().min(1).max(10),
  dimensions: z.string().min(1).max(50),
  sizePrice: z.number().nonnegative().optional(),
  styleId: z.string().min(1).max(80).default("no-style"),
  styleName: z.string().min(1).max(120).default("No style"),
  stylePriceAdjustment: z.number().nonnegative().default(0),
  price: z.number().nonnegative(),
  customText: z.string().trim().max(120).default(""),
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
    fulfillmentType: FulfillmentType;
    address: {
      country: "Philippines";
      houseStreet: string;
      barangay: string;
      barangayCode: string;
      postalCode: string;
      city: string;
      cityCode: string;
      province: string;
      provinceCode: string;
      region: string;
      regionCode: string;
    };
  };
  cart: CheckoutCartItem[];
  delivery: DeliveryQuote;
  itemSubtotal: number;
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
      productId: string;
      sizeId: CheckoutCartItem["sizeId"];
      sizeLabel: string;
      dimensions: string;
      sizePrice: number;
      styleId: string;
      styleName: string;
      stylePriceAdjustment: number;
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
    itemSubtotal: number;
    deliveryFee: number;
    total: number;
    currency: "PHP";
  };
  fulfillment: {
    type: FulfillmentType;
    deliveryFee: number;
    deliveryRuleId: string | null;
    deliveryScope: DeliveryQuote["scope"];
    label: string;
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
  style?: string;
  customText?: string;
};

export function buildGhlProductSummary(items: readonly GhlSummaryItem[]) {
  return items
    .map((item) => {
      const size = item.size?.trim();
      const style = item.style?.trim();
      const meta = [size, style].filter(Boolean).join(", ");
      return `1x ${item.productName}${meta ? ` (${meta})` : ""}`;
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
    state: address.province || address.region,
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
    address.province,
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
    fulfillmentType: getFormString(formData, "fulfillmentType") || "delivery",
    houseStreet: getFormString(formData, "houseStreet"),
    barangay: getFormString(formData, "barangay"),
    barangayCode: getFormString(formData, "barangayCode"),
    postalCode: getFormString(formData, "postalCode"),
    city: getFormString(formData, "city"),
    cityCode: getFormString(formData, "cityCode"),
    province: getFormString(formData, "province"),
    provinceCode: getFormString(formData, "provinceCode"),
    region: getFormString(formData, "region"),
    regionCode: getFormString(formData, "regionCode"),
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
  const address =
    lead.fulfillmentType === "pickup"
      ? PICKUP_BILLING_ADDRESS
      : {
          country: lead.country,
          houseStreet: lead.houseStreet,
          barangay: lead.barangay,
          barangayCode: lead.barangayCode,
          postalCode: lead.postalCode,
          city: lead.city,
          cityCode: lead.cityCode,
          province: lead.province,
          provinceCode: lead.provinceCode,
          region: lead.region,
          regionCode: lead.regionCode,
        };
  return {
    lead: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      messenger: lead.messenger,
      fulfillmentType: lead.fulfillmentType,
      address,
    },
    cart: cartParsed.data,
    delivery: {
      fulfillmentType: lead.fulfillmentType,
      fee: 0,
      ruleId: null,
      scope: lead.fulfillmentType === "pickup" ? "pickup" : "default",
      label: lead.fulfillmentType === "pickup" ? "Free pickup" : "Nationwide delivery",
    },
    itemSubtotal: cartParsed.data.reduce((sum, item) => sum + item.price, 0),
    total: lead.total,
    saveForNextTime: lead.saveForNextTime === "true",
    pageSlug: lead.pageSlug || GHL_PAGE_SLUG_HOME,
    offer: lead.offer || OFFER,
  };
}

export function repriceCheckoutSubmission({
  submission,
  product,
  deliverySettings,
}: {
  submission: CheckoutSubmission;
  product: EngravingProduct;
  deliverySettings: DeliverySettings;
}): CheckoutSubmission {
  const cart = submission.cart.map((item) => {
    const priced = calculateLinePrice({
      product,
      sizeId: item.sizeId,
      styleId: item.styleId,
    });

    return {
      ...item,
      productId: product.id,
      productName: product.name,
      sizeId: priced.size.id,
      sizeLabel: priced.size.label,
      dimensions: priced.size.dimensions,
      sizePrice: priced.size.price,
      styleId: priced.style.id,
      styleName: priced.style.name,
      stylePriceAdjustment: priced.style.priceAdjustment,
      price: priced.price,
      customText: item.customText.trim(),
    };
  });
  const itemSubtotal = cart.reduce((sum, item) => sum + item.price, 0);

  let address = submission.lead.address;
  if (submission.lead.fulfillmentType === "delivery") {
    const validated = validatePsgcAddress(address);
    if (!validated) {
      throw new CheckoutSubmissionError(
        "Please choose a valid Philippine region, province, city/municipality, and barangay.",
      );
    }
    address = {
      ...address,
      region: validated.region,
      regionCode: validated.regionCode,
      province: validated.province,
      provinceCode: validated.provinceCode,
      city: validated.city,
      cityCode: validated.cityCode,
      barangay: validated.barangay,
      barangayCode: validated.barangayCode,
    };
  }

  const delivery = quoteDelivery({
    settings: deliverySettings,
    fulfillmentType: submission.lead.fulfillmentType,
    address,
  });

  return {
    ...submission,
    lead: {
      ...submission.lead,
      address,
    },
    cart,
    delivery,
    itemSubtotal,
    total: itemSubtotal + delivery.fee,
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
    style: item.styleName,
    customText: item.customText,
  }));
  const items = submission.cart.map((item, index) => {
    const photo = dataUrlToPhotoPayload(item.photo.dataUrl);
    return {
      lineNumber: index + 1,
      id: item.id,
      productName: item.productName,
      productId: item.productId,
      size: item.sizeLabel,
      dimensions: item.dimensions,
      style: item.styleName,
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
      itemSubtotal: submission.itemSubtotal,
      deliveryFee: submission.delivery.fee,
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
        productId: item.productId,
        productName: item.productName,
        sizeId: item.sizeId,
        sizeLabel: item.sizeLabel,
        dimensions: item.dimensions,
        sizePrice: item.sizePrice ?? item.price - item.stylePriceAdjustment,
        styleId: item.styleId,
        styleName: item.styleName,
        stylePriceAdjustment: item.stylePriceAdjustment,
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
      itemSubtotal: submission.itemSubtotal,
      deliveryFee: submission.delivery.fee,
      total: submission.total,
      currency: "PHP",
    },
    fulfillment: {
      type: submission.lead.fulfillmentType,
      deliveryFee: submission.delivery.fee,
      deliveryRuleId: submission.delivery.ruleId,
      deliveryScope: submission.delivery.scope,
      label: submission.delivery.label,
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
