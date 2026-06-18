import "server-only";

import { NextResponse } from "next/server";

import { CheckoutSubmissionError } from "@/lib/checkout-submission";
import { FirebaseConfigError } from "@/lib/firebase/admin";
import { createCheckoutOrderFromFormData } from "@/lib/firebase/orders";
import { PaymongoApiError, PaymongoConfigError } from "@/lib/paymongo";

export async function handleCheckoutPost(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  try {
    const { orderId, payment } = await createCheckoutOrderFromFormData(formData);
    return NextResponse.json({ ok: true, orderId, payment });
  } catch (err) {
    if (err instanceof CheckoutSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (err instanceof FirebaseConfigError) {
      console.error("[checkout] Firebase is not configured:", err.message);
      return NextResponse.json(
        {
          error:
            "Checkout storage is not configured yet. Please message us and we'll take it from there.",
        },
        { status: 503 },
      );
    }

    if (err instanceof PaymongoConfigError) {
      console.error("[checkout] PayMongo is not configured:", err.message);
      return NextResponse.json(
        {
          error:
            "PayMongo is not configured yet. Please message us and we'll take it from there.",
        },
        { status: 503 },
      );
    }

    if (err instanceof PaymongoApiError) {
      console.error("[checkout] PayMongo request failed:", err.message);
      return NextResponse.json(
        {
          error:
            "We couldn't create your payment QR just now. Please try again in a moment, or message us and we'll take it from there.",
        },
        { status: 502 },
      );
    }

    console.error("[checkout] Order submission failed:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't save your order just now. Please try again in a moment, or message us and we'll take it from there.",
      },
      { status: 502 },
    );
  }
}
