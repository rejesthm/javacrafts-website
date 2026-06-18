import "server-only";

import { cookies } from "next/headers";

import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { getFirebaseAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "java-crafts-admin-session";
const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export type AdminSession = {
  uid: string;
  email: string;
  name: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getFirebaseAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    if (!isAllowedAdminEmail(decoded.email)) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: typeof decoded.name === "string" ? decoded.name : "",
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new AdminAuthError("Admin login required.");
  return session;
}

export async function createAdminSession(idToken: string) {
  const auth = getFirebaseAuth();
  const decoded = await auth.verifyIdToken(idToken);
  if (!decoded.email_verified) {
    throw new AdminAuthError("Please use a verified Google email.");
  }
  if (!isAllowedAdminEmail(decoded.email)) {
    throw new AdminAuthError("This Google account is not allowed here.");
  }

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_EXPIRES_IN_MS),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
