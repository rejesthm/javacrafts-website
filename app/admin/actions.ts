"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isOrderStatus } from "@/lib/admin-auth";
import { clearAdminSession, requireAdminSession } from "@/lib/admin-session";
import { updateOrderStatus } from "@/lib/firebase/orders";
import {
  DEFAULT_PRODUCT,
  normalizeSlug,
  type DeliveryFeeRule,
  type DeliveryRuleScope,
  type EngravingStyleOption,
  type ProductImage,
  type ProductSizeOption,
  type Testimonial,
} from "@/lib/catalog";
import {
  deleteProductImage,
  getPublicProduct,
  saveDeliverySettings,
  saveProduct,
  saveTestimonials,
  seedSiteDefaults,
  uploadProductImage,
} from "@/lib/firebase/site-content";

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession();
  const orderId = String(formData.get("orderId") ?? "");
  const status = formData.get("status");
  if (!orderId) throw new Error("Missing order id.");
  if (!isOrderStatus(status)) throw new Error("Invalid order status.");

  await updateOrderStatus(orderId, status);
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

function formStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function formNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function indexedActive(formData: FormData, key: string, index: number) {
  return formData.getAll(key).map(String).includes(String(index));
}

function deliveryRuleScope(value: string): DeliveryRuleScope {
  if (value === "barangay" || value === "city") return value;
  return "province";
}

export async function saveCatalogAction(formData: FormData) {
  await requireAdminSession();
  const product = await getPublicProduct();
  const sizeIds = formStrings(formData, "sizeId");
  const sizeLabels = formStrings(formData, "sizeLabel");
  const sizeDimensions = formStrings(formData, "sizeDimensions");
  const sizePrices = formStrings(formData, "sizePrice");

  const sizes: ProductSizeOption[] = sizeLabels
    .map((label, index) => {
      const id = normalizeSlug(sizeIds[index] || label);
      return {
        id,
        label,
        dimensions: sizeDimensions[index] ?? "",
        price: formNumber(sizePrices[index] ?? "0"),
        active: indexedActive(formData, "sizeActive", index),
        sortOrder: index + 1,
      };
    })
    .filter((size) => size.id && size.label && size.dimensions);

  const styleIds = formStrings(formData, "styleId");
  const styleNames = formStrings(formData, "styleName");
  const styleDescriptions = formStrings(formData, "styleDescription");
  const stylePrices = formStrings(formData, "stylePriceAdjustment");

  const styles: EngravingStyleOption[] = styleNames
    .map((name, index) => {
      const id = normalizeSlug(styleIds[index] || name);
      return {
        id,
        name,
        description: styleDescriptions[index] ?? "",
        priceAdjustment: formNumber(stylePrices[index] ?? "0"),
        active: indexedActive(formData, "styleActive", index),
        sortOrder: index + 1,
      };
    })
    .filter((style) => style.id && style.name);

  const imageIds = formStrings(formData, "imageId");
  const imageSrcs = formStrings(formData, "imageSrc");
  const imageAlts = formStrings(formData, "imageAlt");
  const imageCaptions = formStrings(formData, "imageCaption");
  const imageStoragePaths = formStrings(formData, "imageStoragePath");
  const images: ProductImage[] = imageSrcs
    .map((src, index) => {
      const storagePath = imageStoragePaths[index];
      return {
        id: imageIds[index] || crypto.randomUUID(),
        src,
        alt: imageAlts[index] ?? "",
        caption: imageCaptions[index] ?? "",
        ...(storagePath ? { storagePath } : {}),
        sortOrder: index + 1,
      };
    })
    .filter((image) => image.src);

  await saveProduct({
    ...product,
    name: String(formData.get("productName") ?? DEFAULT_PRODUCT.name).trim(),
    active: formData.get("productActive") === "on",
    sizes,
    styles,
    sampleImages: images,
  });
  revalidatePath("/");
  revalidatePath("/admin/catalog");
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdminSession();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }
  await uploadProductImage({
    file,
    alt: String(formData.get("alt") ?? "").trim(),
    caption: String(formData.get("caption") ?? "").trim(),
  });
  revalidatePath("/");
  revalidatePath("/admin/catalog");
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdminSession();
  const imageId = String(formData.get("imageId") ?? "");
  if (!imageId) throw new Error("Missing image id.");
  await deleteProductImage(imageId);
  revalidatePath("/");
  revalidatePath("/admin/catalog");
}

export async function saveTestimonialsAction(formData: FormData) {
  await requireAdminSession();
  const ids = formStrings(formData, "testimonialId");
  const texts = formStrings(formData, "testimonialText");
  const names = formStrings(formData, "testimonialName");
  const roles = formStrings(formData, "testimonialRole");
  const testimonials: Testimonial[] = texts
    .map((text, index) => ({
      id: ids[index] || normalizeSlug(`${names[index] ?? "review"}-${index + 1}`),
      text,
      name: names[index] ?? "",
      role: roles[index] ?? "",
      active: indexedActive(formData, "testimonialActive", index),
      sortOrder: index + 1,
    }))
    .filter((testimonial) => testimonial.text && testimonial.name && testimonial.role);

  await saveTestimonials({
    summary: {
      ratingText: String(formData.get("ratingText") ?? "").trim(),
      happyOrdersText: String(formData.get("happyOrdersText") ?? "").trim(),
    },
    testimonials,
  });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function saveDeliveryAction(formData: FormData) {
  await requireAdminSession();
  const scopes = formStrings(formData, "ruleScope");
  const regions = formStrings(formData, "ruleRegion");
  const provinces = formStrings(formData, "ruleProvince");
  const cities = formStrings(formData, "ruleCity");
  const barangays = formStrings(formData, "ruleBarangay");
  const amounts = formStrings(formData, "ruleAmount");
  const ids = formStrings(formData, "ruleId");

  const rules: DeliveryFeeRule[] = scopes
    .map((scope, index) => ({
      id:
        ids[index] ||
        normalizeSlug([
          scope,
          regions[index],
          provinces[index],
          cities[index],
          barangays[index],
        ].filter(Boolean).join("-")),
      scope: deliveryRuleScope(scope),
      region: regions[index] ?? "",
      province: provinces[index] ?? "",
      city: cities[index] ?? "",
      barangay: barangays[index] ?? "",
      amount: formNumber(amounts[index] ?? "0"),
      active: indexedActive(formData, "ruleActive", index),
      sortOrder: index + 1,
    }))
    .filter((rule) => rule.id && rule.region && rule.province);

  await saveDeliverySettings({
    defaultDeliveryFee: formNumber(String(formData.get("defaultDeliveryFee") ?? "0")),
    pickupLabel: String(formData.get("pickupLabel") ?? "Free pickup").trim(),
    pickupAddress: String(formData.get("pickupAddress") ?? "").trim(),
    rules,
  });
  revalidatePath("/checkout");
  revalidatePath("/admin/delivery");
}

export async function seedSiteDefaultsAction() {
  await requireAdminSession();
  await seedSiteDefaults();
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/delivery");
  revalidatePath("/admin/settings");
}
