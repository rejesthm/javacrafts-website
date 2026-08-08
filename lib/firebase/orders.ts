import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { isOrderStatus, type OrderStatus } from "@/lib/admin-auth";
import {
  CheckoutPriceChangedError,
  buildOrderRecord,
  dataUrlToUpload,
  parseCheckoutFormData,
  repriceCheckoutSubmission,
  type CheckoutSubmission,
  type OrderRecord,
} from "@/lib/checkout-submission";
import { getFirebaseDb, getFirebaseStorageBucket } from "@/lib/firebase/admin";
import { removeUndefinedFirestoreValues } from "@/lib/firebase/firestore-data";
import {
  forwardCheckoutLeadToGhl,
  forwardCheckoutToGhl,
  forwardPaymentUpdateToGhl,
} from "@/lib/firebase/ghl";
import {
  createPendingQrPayment,
  createPaymongoQrPayment,
  toPublicOrderPayment,
  type NormalizedPaymongoWebhookEvent,
  type OrderPayment,
  type PublicOrderPayment,
} from "@/lib/paymongo";
import { getDeliverySettings, getPublicProduct } from "@/lib/firebase/site-content";
import { DEFAULT_PRODUCT } from "@/lib/catalog";
import {
  BUSINESS_CATEGORY,
  GHL_PAGE_SLUG_HOME,
  GOAL_TAG,
  OFFER,
} from "@/lib/site";

export type AdminOrderRecord = Omit<OrderRecord, "order" | "status"> & {
  id: string;
  status: OrderStatus;
  order: Omit<OrderRecord["order"], "items"> & {
    items: Array<
      OrderRecord["order"]["items"][number] & {
        photo: OrderRecord["order"]["items"][number]["photo"] & {
          signedUrl: string | null;
        };
      }
    >;
  };
};

export type CheckoutPaymentStatus = {
  orderId: string;
  payment: PublicOrderPayment;
};

function safeFileStem(fileName: string) {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "photo"
  );
}

function createPhotoPath(
  orderId: string,
  item: CheckoutSubmission["cart"][number],
  index: number,
  extension: string,
) {
  const line = String(index + 1).padStart(2, "0");
  return `orders/${orderId}/items/${line}-${safeFileStem(item.photo.name)}.${extension}`;
}

export async function createCheckoutOrder(submission: CheckoutSubmission) {
  const orderId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const bucket = getFirebaseStorageBucket();
  const photoPaths: string[] = [];

  for (const [index, item] of submission.cart.entries()) {
    const upload = dataUrlToUpload(
      item.photo.dataUrl,
      item.photo.name,
      item.photo.type,
    );
    const storagePath = createPhotoPath(orderId, item, index, upload.extension);
    await bucket.file(storagePath).save(upload.buffer, {
      contentType: upload.contentType,
      resumable: false,
      metadata: {
        cacheControl: "private, max-age=0",
      },
    });
    photoPaths.push(storagePath);
  }

  const record = buildOrderRecord({
    orderId,
    submission,
    submittedAt,
    photoPaths,
  });

  await getFirebaseDb()
    .collection("orders")
    .doc(orderId)
    .set(removeUndefinedFirestoreValues(record));

  const payment = await createPaymongoQrPayment({ orderId, submission });
  await getFirebaseDb().collection("orders").doc(orderId).update({
    payment,
    updatedAt: new Date().toISOString(),
  });

  await forwardCheckoutToGhl({ orderId, submission, submittedAt, payment });

  return {
    orderId,
    record: {
      ...record,
      payment,
    },
    payment: toPublicOrderPayment(payment),
  };
}

export async function createCheckoutOrderFromFormData(formData: FormData) {
  const parsed = parseCheckoutFormData(formData);
  const [product, deliverySettings] = await Promise.all([
    getPublicProduct(),
    getDeliverySettings(),
  ]);
  const submission = repriceCheckoutSubmission({
    submission: parsed,
    product,
    deliverySettings,
  });
  if (Math.abs(parsed.total - submission.total) > 0.01) {
    throw new CheckoutPriceChangedError({
      cart: submission.cart,
      delivery: submission.delivery,
      itemSubtotal: submission.itemSubtotal,
      total: submission.total,
    });
  }
  return createCheckoutOrder(submission);
}

export async function saveCheckoutLead({
  name,
  email,
  pageSlug,
  offer,
  cart,
}: {
  name: string;
  email: string;
  pageSlug?: string;
  offer?: string;
  cart?: {
    itemCount: number;
    total: number;
    items: Array<{
      productName: string;
      size?: string;
      style?: string;
      customText?: string;
      price?: number;
    }>;
  };
}) {
  const submittedAt = new Date().toISOString();
  const docRef = await getFirebaseDb()
    .collection("checkoutLeads")
    .add(
      removeUndefinedFirestoreValues({
        eventType: "checkout_lead_capture",
        submittedAt,
        name,
        email,
        pageSlug: pageSlug || "home",
        offer: offer || "",
        cart: cart
          ? {
              ...cart,
              currency: "PHP",
            }
          : null,
      }),
    );

  const ghl = await forwardCheckoutLeadToGhl({
    name,
    email,
    submittedAt,
    pageSlug,
    offer,
    cart,
  });

  return { leadId: docRef.id, ghl };
}

async function signedUrlFor(storagePath: string) {
  try {
    const [url] = await getFirebaseStorageBucket()
      .file(storagePath)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 30 * 60 * 1000,
      });
    return url;
  } catch (err) {
    console.error(`[admin-orders] Could not sign ${storagePath}:`, err);
    return null;
  }
}

function normalizeAddress(address: Partial<OrderRecord["address"]> | undefined) {
  return {
    country: "Philippines" as const,
    houseStreet: address?.houseStreet ?? "",
    barangay: address?.barangay ?? "",
    barangayCode: address?.barangayCode ?? "",
    postalCode: address?.postalCode ?? "",
    city: address?.city ?? "",
    cityCode: address?.cityCode ?? "",
    province: address?.province ?? "",
    provinceCode: address?.provinceCode ?? "",
    region: address?.region ?? "",
    regionCode: address?.regionCode ?? "",
  };
}

function normalizeOrderItem(
  item: Partial<OrderRecord["order"]["items"][number]>,
  index: number,
): OrderRecord["order"]["items"][number] {
  const price = Number(item.price ?? 0);
  const stylePriceAdjustment = Number(item.stylePriceAdjustment ?? 0);
  return {
    lineNumber: Number(item.lineNumber ?? index + 1),
    id: item.id ?? `legacy-${index + 1}`,
    productName: item.productName ?? DEFAULT_PRODUCT.name,
    productId: item.productId ?? DEFAULT_PRODUCT.id,
    sizeId: item.sizeId ?? String(item.sizeLabel ?? ""),
    sizeLabel: item.sizeLabel ?? "",
    dimensions: item.dimensions ?? "",
    sizePrice: Number(item.sizePrice ?? Math.max(0, price - stylePriceAdjustment)),
    styleId: item.styleId ?? "no-style",
    styleName: item.styleName ?? "No style",
    stylePriceAdjustment,
    price,
    customText: item.customText ?? "",
    createdAt: item.createdAt ?? "",
    photo: {
      fileName: item.photo?.fileName ?? "",
      fileType: item.photo?.fileType ?? "",
      fileSize: Number(item.photo?.fileSize ?? 0),
      storagePath: item.photo?.storagePath ?? "",
    },
  };
}

export async function listRecentOrders(limit = 50): Promise<AdminOrderRecord[]> {
  const snapshot = await getFirebaseDb()
    .collection("orders")
    .orderBy("submittedAt", "desc")
    .limit(limit)
    .get();

  return mapAdminOrderDocs(snapshot.docs);
}

async function mapAdminOrderDocs(
  docs: Array<{ id: string; data: () => FirebaseFirestore.DocumentData }>,
): Promise<AdminOrderRecord[]> {
  return Promise.all(
    docs.map(async (doc) => {
      const data = doc.data() as Partial<OrderRecord>;
      const status = isOrderStatus(data.status) ? data.status : "new";
      const rawOrder = data.order ?? {
        items: [],
        itemCount: 0,
        itemSubtotal: 0,
        deliveryFee: 0,
        total: 0,
        currency: "PHP" as const,
      };
      const normalizedItems = (rawOrder.items ?? []).map(normalizeOrderItem);
      const itemSubtotal = Number(
        rawOrder.itemSubtotal ??
          normalizedItems.reduce((sum, item) => sum + item.price, 0),
      );
      const deliveryFee = Number(rawOrder.deliveryFee ?? 0);
      const total = Number(rawOrder.total ?? itemSubtotal + deliveryFee);
      const payment = data.payment ?? createPendingQrPayment(total);
      const items = await Promise.all(
        normalizedItems.map(async (item) => ({
          ...item,
          photo: {
            ...item.photo,
            signedUrl: item.photo.storagePath
              ? await signedUrlFor(item.photo.storagePath)
              : null,
          },
        })),
      );
      const fulfillment = data.fulfillment ?? {
        type: "delivery" as const,
        deliveryFee,
        deliveryRuleId: null,
        deliveryScope: "default" as const,
        label: "Legacy delivery",
      };
      const source = data.source ?? {
        pageSlug: GHL_PAGE_SLUG_HOME,
        offer: OFFER,
        businessCategory: BUSINESS_CATEGORY,
        goal: GOAL_TAG,
        saveForNextTime: false,
      };

      return {
        ...data,
        id: doc.id,
        orderId: data.orderId ?? doc.id,
        status,
        submittedAt: data.submittedAt ?? "",
        updatedAt: data.updatedAt ?? data.submittedAt ?? "",
        customer: {
          name: data.customer?.name ?? "",
          email: data.customer?.email ?? "",
          phone: data.customer?.phone ?? "",
          messenger: data.customer?.messenger ?? "",
        },
        address: normalizeAddress(data.address),
        fulfillment,
        source,
        payment,
        order: {
          ...rawOrder,
          itemCount: Number(rawOrder.itemCount ?? items.length),
          itemSubtotal,
          deliveryFee,
          total,
          currency: "PHP",
          items,
        },
      };
    }),
  );
}

export function subscribeToRecentOrders(
  onOrders: (orders: AdminOrderRecord[]) => void,
  onError: (error: Error) => void,
  limit = 50,
) {
  return getFirebaseDb()
    .collection("orders")
    .orderBy("submittedAt", "desc")
    .limit(limit)
    .onSnapshot(
      (snapshot) => {
        void mapAdminOrderDocs(snapshot.docs).then(onOrders).catch(onError);
      },
      onError,
    );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await getFirebaseDb().collection("orders").doc(orderId).update({
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function getCheckoutPaymentStatus(
  orderId: string,
): Promise<CheckoutPaymentStatus | null> {
  const doc = await getFirebaseDb().collection("orders").doc(orderId).get();
  if (!doc.exists) return null;
  const data = doc.data() as OrderRecord;
  const payment = data.payment ?? createPendingQrPayment(data.order.total);
  return {
    orderId,
    payment: toPublicOrderPayment(payment),
  };
}

export function subscribeToCheckoutPaymentStatus(
  orderId: string,
  onStatus: (status: CheckoutPaymentStatus | null) => void,
  onError: (error: Error) => void,
) {
  return getFirebaseDb()
    .collection("orders")
    .doc(orderId)
    .onSnapshot(
      (doc) => {
        if (!doc.exists) {
          onStatus(null);
          return;
        }
        const data = doc.data() as OrderRecord;
        const payment = data.payment ?? createPendingQrPayment(data.order.total);
        onStatus({ orderId, payment: toPublicOrderPayment(payment) });
      },
      onError,
    );
}

async function findOrderForPaymongoEvent(event: NormalizedPaymongoWebhookEvent) {
  const db = getFirebaseDb();
  if (event.orderId) {
    const byId = await db.collection("orders").doc(event.orderId).get();
    if (byId.exists) return byId;
  }

  if (!event.paymentIntentId) return null;

  const snapshot = await db
    .collection("orders")
    .where("payment.paymongoPaymentIntentId", "==", event.paymentIntentId)
    .limit(1)
    .get();
  return snapshot.docs[0] ?? null;
}

export async function applyPaymongoWebhookEvent(
  event: NormalizedPaymongoWebhookEvent,
) {
  const doc = await findOrderForPaymongoEvent(event);
  if (!doc) return { ok: false as const, reason: "order_not_found" as const };

  const order = doc.data() as OrderRecord;
  const webhookEventIds = order.payment?.webhookEventIds ?? [];
  if (webhookEventIds.includes(event.eventId)) {
    return { ok: true as const, duplicate: true as const, order };
  }

  const paymentPatch: Partial<OrderPayment> = {
    status: event.status,
  };
  if (event.paymentId) paymentPatch.paymentId = event.paymentId;
  if (event.status === "paid") {
    paymentPatch.paidAt = event.paidAt ?? new Date().toISOString();
  }

  const update: Record<string, unknown> = {
    "payment.status": paymentPatch.status,
    "payment.webhookEventIds": FieldValue.arrayUnion(event.eventId),
    updatedAt: new Date().toISOString(),
  };
  if (paymentPatch.paymentId) update["payment.paymentId"] = paymentPatch.paymentId;
  if (paymentPatch.paidAt) update["payment.paidAt"] = paymentPatch.paidAt;

  await doc.ref.update(update);
  const updatedDoc = await doc.ref.get();
  const updatedOrder = updatedDoc.data() as OrderRecord;

  await forwardPaymentUpdateToGhl({ order: updatedOrder, event });

  return { ok: true as const, duplicate: false as const, order: updatedOrder };
}
