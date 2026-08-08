import { NextResponse } from "next/server";

import { FirebaseConfigError } from "@/lib/firebase/admin";
import {
  getCheckoutPaymentStatus,
  subscribeToCheckoutPaymentStatus,
} from "@/lib/firebase/orders";
import { createEventStream } from "@/lib/server-sent-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  try {
    const initial = await getCheckoutPaymentStatus(orderId);
    if (!initial) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const events = createEventStream(request);
    events.send("snapshot", initial);
    const unsubscribe = subscribeToCheckoutPaymentStatus(
      orderId,
      (status) => {
        if (status) events.send("snapshot", status);
      },
      (error) => {
        console.error("[payment-stream] Firestore listener failed:", error.message);
        events.send("stream-error", { error: "Payment updates disconnected." });
        events.close();
      },
    );
    events.onClose(unsubscribe);
    return events.response;
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      return NextResponse.json(
        { error: "Payment status is not configured yet." },
        { status: 503 },
      );
    }
    console.error("[payment-stream] Could not open stream:", error);
    return NextResponse.json(
      { error: "Could not open payment updates." },
      { status: 502 },
    );
  }
}
