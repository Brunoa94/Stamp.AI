type JsonLdValueType = unknown;

/**
 * Recursively drops `null`/`undefined` properties from a JSON-LD object so
 * unknown facts are omitted instead of emitted as empty or placeholder values.
 * Arrays are preserved (items are cleaned, not removed).
 */
export function omitNullish<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitNullish(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, JsonLdValueType> = {};
    for (const [key, entry] of Object.entries(value as object)) {
      if (entry === null || entry === undefined) continue;
      cleaned[key] = omitNullish(entry);
    }
    return cleaned as T;
  }
  return value;
}
