import { handleCheckoutPost } from "@/lib/checkout-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleCheckoutPost(request);
}
