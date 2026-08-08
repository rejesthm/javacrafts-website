import { z } from "zod";

export const SINGLE_PRODUCT_ID = "personalized-engraved-plaque";

export type ProductSizeOption = {
  id: string;
  label: string;
  dimensions: string;
  price: number;
  active: boolean;
  sortOrder: number;
};

export type EngravingStyleOption = {
  id: string;
  name: string;
  description: string;
  priceAdjustment: number;
  active: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  storagePath?: string;
  sortOrder: number;
};

export type EngravingProduct = {
  id: string;
  name: string;
  active: boolean;
  sizes: ProductSizeOption[];
  styles: EngravingStyleOption[];
  sampleImages: ProductImage[];
  updatedAt?: string;
};

export type Testimonial = {
  id: string;
  text: string;
  name: string;
  role: string;
  active: boolean;
  sortOrder: number;
};

export type TestimonialSummary = {
  ratingText: string;
  happyOrdersText: string;
};

export type TestimonialsContent = {
  summary: TestimonialSummary;
  testimonials: Testimonial[];
  updatedAt?: string;
};

export type DeliveryRuleScope = "province" | "city" | "barangay";

export type FulfillmentType = "delivery" | "pickup";

export type DeliveryFeeRule = {
  id: string;
  scope: DeliveryRuleScope;
  region: string;
  province: string;
  city: string;
  barangay: string;
  amount: number;
  active: boolean;
  sortOrder: number;
};

export type DeliverySettings = {
  defaultDeliveryFee: number;
  pickupLabel: string;
  pickupAddress: string;
  rules: DeliveryFeeRule[];
  updatedAt?: string;
};

export type DeliveryAddressInput = {
  region: string;
  province: string;
  city: string;
  barangay: string;
};

export type DeliveryQuote = {
  fulfillmentType: FulfillmentType;
  fee: number;
  ruleId: string | null;
  scope: DeliveryRuleScope | "pickup" | "default";
  label: string;
};

export type CatalogLineInput = {
  productId: string;
  sizeId: string;
  styleId: string;
};

export type CatalogLinePrice = {
  product: EngravingProduct;
  size: ProductSizeOption;
  style: EngravingStyleOption;
  price: number;
};

export const DEFAULT_PRODUCT: EngravingProduct = {
  id: SINGLE_PRODUCT_ID,
  name: "Personalized Engraved Plaque",
  active: true,
  sizes: [
    {
      id: "s",
      label: "S",
      dimensions: "5x7 inches",
      price: 400,
      active: true,
      sortOrder: 1,
    },
    {
      id: "m",
      label: "M",
      dimensions: "8x6 inches",
      price: 650,
      active: true,
      sortOrder: 2,
    },
    {
      id: "l",
      label: "L",
      dimensions: "10x8 inches",
      price: 850,
      active: true,
      sortOrder: 3,
    },
  ],
  styles: [
    {
      id: "no-style",
      name: "No style",
      description: "Classic clean engraving from your uploaded photo.",
      priceAdjustment: 0,
      active: true,
      sortOrder: 1,
    },
    {
      id: "sketch-style-engraving",
      name: "Sketch-style engraving",
      description: "Soft pencil-sketch lines for portraits and keepsakes.",
      priceAdjustment: 0,
      active: true,
      sortOrder: 2,
    },
    {
      id: "cross-hatching-engraving",
      name: "Cross-Hatching Engraving",
      description: "Detailed line shading with a hand-illustrated feel.",
      priceAdjustment: 0,
      active: true,
      sortOrder: 3,
    },
  ],
  sampleImages: [
    {
      id: "sample-custom",
      src: "/products/plaque-custom.png",
      alt: "Laser-engraved wooden plaque with portrait and personalized name",
      caption: "Custom portrait · 8x6 in · P650",
      sortOrder: 1,
    },
    {
      id: "sample-portrait",
      src: "/products/plaque-portrait.png",
      alt: "Wooden plaque with detailed engraved portrait on a stand",
      caption: "Engraved portrait · 5x7 in · P400",
      sortOrder: 2,
    },
    {
      id: "sample-family",
      src: "/products/plaque-family.png",
      alt: "Family portrait engraved on a light wood plaque",
      caption: "Family keepsake · 10x8 in · P850",
      sortOrder: 3,
    },
    {
      id: "sample-appreciation",
      src: "/products/plaque-appreciation.png",
      alt: "Custom appreciation plaque with photo and ceremony details",
      caption: "Appreciation plaque · 8x6 in · P650",
      sortOrder: 4,
    },
    {
      id: "sample-commemorative",
      src: "/products/plaque-commemorative.png",
      alt: "Commemorative wooden plaque with engraved portrait and dedication",
      caption: "Commemorative piece · 10x8 in · P850",
      sortOrder: 5,
    },
  ],
};

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  summary: {
    ratingText: "4.9 / 5",
    happyOrdersText: "from 200+ happy orders",
  },
  testimonials: [
    {
      id: "mariel-s",
      text: "Sobrang ganda ng pagkakagawa! Nag-order ako ng wooden keychain para sa anniversary namin at grabe ang quality. Ang linis ng engraving, parang ang sarap hawakan. Sulit na sulit.",
      name: "Mariel S.",
      role: "Davao City",
      active: true,
      sortOrder: 1,
    },
    {
      id: "jandro-t",
      text: "Salamat kaayo, Java Crafts! Na-impress jud ko sa kalidad sa plaque nga akong gi-order. Limpyo kaayo ang engrave ug gwapo tan-awon. Mo-order gyud ko og balik.",
      name: "Jandro T.",
      role: "Cebu City",
      active: true,
      sortOrder: 2,
    },
    {
      id: "shaira-m",
      text: "I gave this as a graduation gift and na-iyak talaga yung ate ko. The engraving was so detailed-parang hindi machine-made. Highly recommended!",
      name: "Shaira M.",
      role: "Tagum City",
      active: true,
      sortOrder: 3,
    },
    {
      id: "aljun-r",
      text: "Mas nindot pa ang output kaysa sa picture, grabe! Ang bilis pa sa transaction ug ang buotan mo-reply. Salamat kaayo sa inyo.",
      name: "Aljun R.",
      role: "Panabo City",
      active: true,
      sortOrder: 4,
    },
    {
      id: "liza-c",
      text: "Ginamit namin ito bilang pasalubong para sa buong team. Natuwa silang lahat-ang thoughtful daw. Sobrang sulit ng binayad namin.",
      name: "Liza C.",
      role: "Team gifts",
      active: true,
      sortOrder: 5,
    },
    {
      id: "daryl-o",
      text: "Last-minute ako nag-order pero na-deliver pa rin on time, salamat! Ang linis ng engraving at ang bilis nila mag-update. Order ulit ako pag Pasko.",
      name: "Daryl O.",
      role: "Cagayan de Oro",
      active: true,
      sortOrder: 6,
    },
    {
      id: "kim-p",
      text: "Pihikan kaayo ko sa font ug spacing, pero gi-sunod gyud nila akong reference. Hapsay pa ang packaging, andam na ihatag nga regalo. Solid kaayo!",
      name: "Kim P.",
      role: "Cebu City",
      active: true,
      sortOrder: 7,
    },
    {
      id: "rhea-f",
      text: "Pang-anniversary 'to ng parents ko. Tuwing nakikita nila, naiiyak sila sa tuwa. Worth every peso, promise.",
      name: "Rhea F.",
      role: "Anniversary gift",
      active: true,
      sortOrder: 8,
    },
    {
      id: "nico-i",
      text: "No drama-solid ang craftsmanship ug buotan kaayo ang customer service. Mo-reply dayon sila pag naa kay pangutana. Balik gyud ko ani sunod holidays.",
      name: "Nico I.",
      role: "Repeat customer",
      active: true,
      sortOrder: 9,
    },
  ],
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  defaultDeliveryFee: 180,
  pickupLabel: "Free pickup",
  pickupAddress: "Maniki, Kapalong, Davao del Norte",
  rules: [
    {
      id: "local-kapalong",
      scope: "city",
      region: "Region XI (Davao Region)",
      province: "Davao del Norte",
      city: "Kapalong",
      barangay: "",
      amount: 80,
      active: true,
      sortOrder: 1,
    },
    {
      id: "davao-del-norte",
      scope: "province",
      region: "Region XI (Davao Region)",
      province: "Davao del Norte",
      city: "",
      barangay: "",
      amount: 120,
      active: true,
      sortOrder: 2,
    },
  ],
};

export const productSizeSchema = z.object({
  id: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(20),
  dimensions: z.string().trim().min(1).max(80),
  price: z.coerce.number().int().min(0).max(500000),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const engravingStyleSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).default(""),
  priceAdjustment: z.coerce.number().int().min(0).max(500000).default(0),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const productImageSchema = z.object({
  id: z.string().trim().min(1).max(120),
  src: z.string().trim().min(1).max(1000),
  alt: z.string().trim().max(240).default(""),
  caption: z.string().trim().max(160).default(""),
  storagePath: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const engravingProductSchema = z.object({
  id: z.literal(SINGLE_PRODUCT_ID).default(SINGLE_PRODUCT_ID),
  name: z.string().trim().min(1).max(120),
  active: z.coerce.boolean().default(true),
  sizes: z.array(productSizeSchema).min(1).max(12),
  styles: z.array(engravingStyleSchema).min(1).max(12),
  sampleImages: z.array(productImageSchema).max(20).default([]),
  updatedAt: z.string().optional(),
});

export const testimonialSchema = z.object({
  id: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1).max(800),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const testimonialsContentSchema = z.object({
  summary: z.object({
    ratingText: z.string().trim().min(1).max(40),
    happyOrdersText: z.string().trim().min(1).max(80),
  }),
  testimonials: z.array(testimonialSchema).max(30),
  updatedAt: z.string().optional(),
});

export const deliveryRuleSchema = z.object({
  id: z.string().trim().min(1).max(120),
  scope: z.enum(["province", "city", "barangay"]),
  region: z.string().trim().min(1).max(120),
  province: z.string().trim().min(1).max(120),
  city: z.string().trim().max(120).default(""),
  barangay: z.string().trim().max(120).default(""),
  amount: z.coerce.number().int().min(0).max(500000),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const deliverySettingsSchema = z.object({
  defaultDeliveryFee: z.coerce.number().int().min(0).max(500000),
  pickupLabel: z.string().trim().min(1).max(80),
  pickupAddress: z.string().trim().min(1).max(200),
  rules: z.array(deliveryRuleSchema).max(100),
  updatedAt: z.string().optional(),
});

export function sortedActiveSizes(product: EngravingProduct) {
  return product.sizes
    .filter((size) => size.active)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function sortedActiveStyles(product: EngravingProduct) {
  return product.styles
    .filter((style) => style.active)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function sortedActiveImages(product: EngravingProduct) {
  return product.sampleImages
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.caption.localeCompare(b.caption));
}

export function getDefaultSize(product: EngravingProduct) {
  return sortedActiveSizes(product)[0] ?? product.sizes[0] ?? DEFAULT_PRODUCT.sizes[0]!;
}

export function getDefaultStyle(product: EngravingProduct) {
  const styles = sortedActiveStyles(product);
  return (
    styles.find((style) => style.id === "no-style") ??
    styles[0] ??
    product.styles[0] ??
    DEFAULT_PRODUCT.styles[0]!
  );
}

export function calculateLinePrice({
  product,
  sizeId,
  styleId,
}: {
  product: EngravingProduct;
  sizeId: string;
  styleId: string;
}): CatalogLinePrice {
  if (!product.active) {
    throw new Error("This product is not available right now.");
  }

  const size = product.sizes.find((option) => option.id === sizeId && option.active);
  if (!size) throw new Error("Selected size is not available.");

  const style = product.styles.find((option) => option.id === styleId && option.active);
  if (!style) throw new Error("Selected style is not available.");

  return {
    product,
    size,
    style,
    price: size.price + style.priceAdjustment,
  };
}

function samePlace(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function quoteDelivery({
  settings,
  fulfillmentType,
  address,
}: {
  settings: DeliverySettings;
  fulfillmentType: FulfillmentType;
  address?: DeliveryAddressInput;
}): DeliveryQuote {
  if (fulfillmentType === "pickup") {
    return {
      fulfillmentType,
      fee: 0,
      ruleId: null,
      scope: "pickup",
      label: settings.pickupLabel,
    };
  }

  if (!address) {
    return {
      fulfillmentType,
      fee: settings.defaultDeliveryFee,
      ruleId: null,
      scope: "default",
      label: "Nationwide delivery",
    };
  }

  const rules = settings.rules
    .filter((rule) => rule.active)
    .toSorted((a, b) => {
      const rank = { barangay: 0, city: 1, province: 2 } satisfies Record<DeliveryRuleScope, number>;
      return rank[a.scope] - rank[b.scope] || a.sortOrder - b.sortOrder;
    });

  const match = rules.find((rule) => {
    if (!samePlace(rule.region, address.region)) return false;
    if (!samePlace(rule.province, address.province)) return false;
    if (rule.scope === "province") return true;
    if (!samePlace(rule.city, address.city)) return false;
    if (rule.scope === "city") return true;
    return samePlace(rule.barangay, address.barangay);
  });

  if (match) {
    return {
      fulfillmentType,
      fee: match.amount,
      ruleId: match.id,
      scope: match.scope,
      label:
        match.scope === "barangay"
          ? `${match.barangay}, ${match.city}`
          : match.scope === "city"
            ? match.city
            : match.province,
    };
  }

  return {
    fulfillmentType,
    fee: settings.defaultDeliveryFee,
    ruleId: null,
    scope: "default",
    label: "Nationwide delivery",
  };
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
