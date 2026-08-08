import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-session";
import { FirebaseConfigError } from "@/lib/firebase/admin";
import { subscribeToRecentOrders } from "@/lib/firebase/orders";
import { createEventStream } from "@/lib/server-sent-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  try {
    const events = createEventStream(request);
    const unsubscribe = subscribeToRecentOrders(
      (orders) => events.send("snapshot", { orders }),
      (error) => {
        console.error("[admin-orders-stream] Firestore listener failed:", error.message);
        events.send("stream-error", { error: "Order updates disconnected." });
        events.close();
      },
    );
    events.onClose(unsubscribe);
    return events.response;
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured." },
        { status: 503 },
      );
    }
    console.error("[admin-orders-stream] Could not open stream:", error);
    return NextResponse.json(
      { error: "Could not open order updates." },
      { status: 502 },
    );
  }
}
