import "server-only";

import {
  DEFAULT_DELIVERY_SETTINGS,
  DEFAULT_PRODUCT,
  DEFAULT_TESTIMONIALS,
  SINGLE_PRODUCT_ID,
  deliverySettingsSchema,
  engravingProductSchema,
  testimonialsContentSchema,
  type DeliverySettings,
  type EngravingProduct,
  type ProductImage,
  type TestimonialsContent,
} from "@/lib/catalog";
import { FirebaseConfigError, getFirebaseDb, getFirebaseStorageBucket } from "@/lib/firebase/admin";
import { removeUndefinedFirestoreValues } from "@/lib/firebase/firestore-data";

const SETTINGS_COLLECTION = "siteSettings";
const PRODUCT_DOC = "product";
const TESTIMONIALS_DOC = "testimonials";
const DELIVERY_DOC = "delivery";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nowIso() {
  return new Date().toISOString();
}

function settingsDoc(id: string) {
  return getFirebaseDb().collection(SETTINGS_COLLECTION).doc(id);
}

async function readDoc<T>({
  docId,
  fallback,
  parse,
}: {
  docId: string;
  fallback: T;
  parse: (value: unknown) => T;
}) {
  try {
    const doc = await settingsDoc(docId).get();
    if (!doc.exists) return clone(fallback);
    return parse(doc.data());
  } catch (err) {
    if (err instanceof FirebaseConfigError) return clone(fallback);
    throw err;
  }
}

export async function getPublicProduct(): Promise<EngravingProduct> {
  return readDoc({
    docId: PRODUCT_DOC,
    fallback: DEFAULT_PRODUCT,
    parse: (value) => engravingProductSchema.parse(value),
  });
}

export async function getPublicTestimonials(): Promise<TestimonialsContent> {
  return readDoc({
    docId: TESTIMONIALS_DOC,
    fallback: DEFAULT_TESTIMONIALS,
    parse: (value) => testimonialsContentSchema.parse(value),
  });
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  return readDoc({
    docId: DELIVERY_DOC,
    fallback: DEFAULT_DELIVERY_SETTINGS,
    parse: (value) => deliverySettingsSchema.parse(value),
  });
}

export async function saveProduct(product: EngravingProduct) {
  const parsed = engravingProductSchema.parse({
    ...product,
    id: SINGLE_PRODUCT_ID,
    updatedAt: nowIso(),
  });
  await settingsDoc(PRODUCT_DOC).set(removeUndefinedFirestoreValues(parsed));
  return parsed;
}

export async function saveTestimonials(content: TestimonialsContent) {
  const parsed = testimonialsContentSchema.parse({
    ...content,
    updatedAt: nowIso(),
  });
  await settingsDoc(TESTIMONIALS_DOC).set(removeUndefinedFirestoreValues(parsed));
  return parsed;
}

export async function saveDeliverySettings(settings: DeliverySettings) {
  const parsed = deliverySettingsSchema.parse({
    ...settings,
    updatedAt: nowIso(),
  });
  await settingsDoc(DELIVERY_DOC).set(removeUndefinedFirestoreValues(parsed));
  return parsed;
}

export async function seedSiteDefaults() {
  const db = getFirebaseDb();
  const batch = db.batch();
  const seededAt = nowIso();
  batch.set(
    settingsDoc(PRODUCT_DOC),
    removeUndefinedFirestoreValues({ ...DEFAULT_PRODUCT, updatedAt: seededAt, seededAt }),
    { merge: true },
  );
  batch.set(
    settingsDoc(TESTIMONIALS_DOC),
    removeUndefinedFirestoreValues({ ...DEFAULT_TESTIMONIALS, updatedAt: seededAt, seededAt }),
    { merge: true },
  );
  batch.set(
    settingsDoc(DELIVERY_DOC),
    removeUndefinedFirestoreValues({ ...DEFAULT_DELIVERY_SETTINGS, updatedAt: seededAt, seededAt }),
    { merge: true },
  );
  await batch.commit();
}

function safeFileStem(fileName: string) {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product-image"
  );
}

function extensionForType(type: string) {
  switch (type) {
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

export async function uploadProductImage({
  file,
  alt,
  caption,
}: {
  file: File;
  alt: string;
  caption: string;
}) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Upload a JPG, PNG, or WebP image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Product images must be 5MB or smaller.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const storagePath = `site/product-images/${Date.now()}-${safeFileStem(file.name)}.${extensionForType(file.type)}`;
  const bucket = getFirebaseStorageBucket();
  const storageFile = bucket.file(storagePath);
  await storageFile.save(bytes, {
    contentType: file.type,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  await storageFile.makePublic();

  const image: ProductImage = {
    id: crypto.randomUUID(),
    src: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
    alt,
    caption,
    storagePath,
    sortOrder: Date.now(),
  };

  const product = await getPublicProduct();
  await saveProduct({
    ...product,
    sampleImages: [...product.sampleImages, image],
  });

  return image;
}

export async function deleteProductImage(imageId: string) {
  const product = await getPublicProduct();
  const image = product.sampleImages.find((item) => item.id === imageId);
  if (!image) return;

  const nextImages = product.sampleImages.filter((item) => item.id !== imageId);
  await saveProduct({ ...product, sampleImages: nextImages });

  if (image.storagePath) {
    await getFirebaseStorageBucket()
      .file(image.storagePath)
      .delete({ ignoreNotFound: true })
      .catch(() => undefined);
  }
}
