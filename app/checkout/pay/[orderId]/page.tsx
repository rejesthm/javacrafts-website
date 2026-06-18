import type { Metadata } from "next";

import { CheckoutPaymentClient } from "@/components/checkout-payment-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pay by QR — ${BRAND_NAME}`,
  description: "Scan your PayMongo QR Ph code to complete your Java Crafts order.",
};

export default async function CheckoutPayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutPaymentClient orderId={orderId} />
      </main>
      <SiteFooter />
    </>
  );
}
