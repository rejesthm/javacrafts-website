function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function removeUndefinedFirestoreValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedFirestoreValues(item)) as T;
  }

  if (!isPlainRecord(value)) return value;

  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => [key, removeUndefinedFirestoreValues(item)]);

  return Object.fromEntries(entries) as T;
}
