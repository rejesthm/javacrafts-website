import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AdminAuthError,
  clearAdminSession,
  createAdminSession,
} from "@/lib/admin-session";
import { FirebaseConfigError } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }

  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login token." }, { status: 400 });
  }

  try {
    await createAdminSession(parsed.data.idToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof FirebaseConfigError) {
      console.error("[admin-session] Firebase is not configured:", err.message);
      return NextResponse.json(
        { error: "Firebase Admin env values are missing." },
        { status: 503 },
      );
    }
    console.error("[admin-session] Login failed:", err);
    return NextResponse.json({ error: "Admin login failed." }, { status: 401 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
