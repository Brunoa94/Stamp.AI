import type {
  LocalizedProductTextT,
  ProductLabelKindT,
  ProductTextT,
} from "@/shared/types/productText";

/**
 * Display-only product translations. Each function takes the visitor's
 * product text (null for English) and returns the translation when one
 * exists, otherwise the English value it was given. Never feed the result
 * back into logic, stores or payloads: those stay English.
 *
 * This module imports no language data, so client bundles don't carry it:
 * the server gets the text from `productTextFor(locale)`, the client from
 * `useProductText()`, which loads only the visitor's language.
 */

/** "Heather  Grey" → "heather-grey", the key colour and paper-type labels use */
export function normalizeLabelKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** The product's title, description and specs, translated field by field */
export function localizeProductText(
  text: ProductTextT | null,
  blueprintId: number,
  english: LocalizedProductTextT,
): LocalizedProductTextT {
  const translation = text?.products[blueprintId];
  if (!translation) return english;

  return {
    title: translation.title ?? english.title,
    description: translation.description ?? english.description,
    specs: translation.specs ?? english.specs,
  };
}

/**
 * A colour or paper-type name; unknown values show in English. Printify puts
 * notebook paper types in the colour option, so a colour lookup also checks
 * the paper-type list.
 */
export function localizeProductLabel(
  text: ProductTextT | null,
  kind: ProductLabelKindT,
  englishValue: string,
): string {
  const key = normalizeLabelKey(englishValue);
  const fromKind = text?.labels[kind][key];
  const fromPaperType = kind === "color" ? text?.labels.paperType[key] : undefined;
  return fromKind ?? fromPaperType ?? englishValue;
}

/** English colour name → its label, for swatches rendered on the client */
export function localizeColorLabels(
  text: ProductTextT | null,
  englishColors: string[],
): Record<string, string> {
  return Object.fromEntries(
    englishColors.map((color) => [color, localizeProductLabel(text, "color", color)]),
  );
}

/** A cart line's title, looked up by blueprint; rows without one keep the stored name */
export function localizeCartItemName(
  text: ProductTextT | null,
  blueprintId: number | null,
  storedName: string,
): string {
  if (blueprintId === null) return storedName;
  return text?.products[blueprintId]?.title ?? storedName;
}
