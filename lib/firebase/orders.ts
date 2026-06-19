import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { isOrderStatus, type OrderStatus } from "@/lib/admin-auth";
import {
  buildOrderRecord,
  dataUrlToUpload,
  parseCheckoutFormData,
  type CheckoutSubmission,
  type OrderRecord,
} from "@/lib/checkout-submission";
import { getFirebaseDb, getFirebaseStorageBucket } from "@/lib/firebase/admin";
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

  await getFirebaseDb().collection("orders").doc(orderId).set(record);

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
  return createCheckoutOrder(parseCheckoutFormData(formData));
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
      customText?: string;
      price?: number;
    }>;
  };
}) {
  const submittedAt = new Date().toISOString();
  const docRef = await getFirebaseDb()
    .collection("checkoutLeads")
    .add({
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
    });

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

export async function listRecentOrders(limit = 50): Promise<AdminOrderRecord[]> {
  const snapshot = await getFirebaseDb()
    .collection("orders")
    .orderBy("submittedAt", "desc")
    .limit(limit)
    .get();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as OrderRecord;
      const status = isOrderStatus(data.status) ? data.status : "new";
      const payment = data.payment ?? createPendingQrPayment(data.order.total);
      const items = await Promise.all(
        data.order.items.map(async (item) => ({
          ...item,
          photo: {
            ...item.photo,
            signedUrl: await signedUrlFor(item.photo.storagePath),
          },
        })),
      );

      return {
        ...data,
        id: doc.id,
        status,
        payment,
        order: {
          ...data.order,
          items,
        },
      };
    }),
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
