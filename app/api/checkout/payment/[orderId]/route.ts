import { NextResponse } from "next/server";

import { FirebaseConfigError } from "@/lib/firebase/admin";
import { getCheckoutPaymentStatus } from "@/lib/firebase/orders";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  try {
    const status = await getCheckoutPaymentStatus(orderId);
    if (!status) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...status });
  } catch (err) {
    if (err instanceof FirebaseConfigError) {
      console.error("[payment-status] Firebase is not configured:", err.message);
      return NextResponse.json(
        { error: "Payment status is not configured yet." },
        { status: 503 },
      );
    }
    console.error("[payment-status] Could not load payment status:", err);
    return NextResponse.json(
      { error: "Could not load payment status." },
      { status: 502 },
    );
  }
}
