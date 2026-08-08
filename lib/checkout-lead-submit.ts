import type { SavedCheckoutLead } from "@/lib/order";

type LeadCartSummary = {
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

export type CheckoutLeadPayload = SavedCheckoutLead & {
  pageSlug?: string;
  offer?: string;
  cart?: LeadCartSummary;
};

type CheckoutLeadSuccess = {
  ok: true;
  leadId: string;
};

type CheckoutLeadFailure = {
  ok?: false;
  error?: string;
};

type Fetcher = typeof fetch;

export async function submitCheckoutLead(
  payload: CheckoutLeadPayload,
  fetcher: Fetcher = fetch,
): Promise<CheckoutLeadSuccess> {
  const res = await fetcher("/api/checkout-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as
    | CheckoutLeadSuccess
    | CheckoutLeadFailure;

  if (!res.ok || data.ok !== true) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "We couldn't save your details just now. Please try again.",
    );
  }

  return data;
}
