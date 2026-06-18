export const DEFAULT_ADMIN_EMAIL = "rejesthm@gmail.com";

export const ORDER_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function isAllowedAdminEmail(
  email: string | null | undefined,
  adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
) {
  const allowed = normalizeEmail(adminEmail);
  return Boolean(allowed) && normalizeEmail(email) === allowed;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.includes(value as OrderStatus)
  );
}
