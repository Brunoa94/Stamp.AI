type MessagesT = { [key: string]: unknown };

const isNamespace = (value: unknown): value is MessagesT =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The translation laid over the base (English) messages, key by key, so a
 * string missing from the translation shows in English instead of erroring.
 */
export function mergeMessages(base: MessagesT, translation: MessagesT): MessagesT {
  const merged: MessagesT = { ...base };

  for (const [key, value] of Object.entries(translation)) {
    const baseValue = base[key];
    merged[key] = isNamespace(baseValue) && isNamespace(value) ? mergeMessages(baseValue, value) : value;
  }

  return merged;
}
