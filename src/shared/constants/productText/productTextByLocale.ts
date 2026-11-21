import type { ProductTextByLocaleT, ProductTextT } from "@/shared/types/productText";
import { PRODUCT_TEXT_NL } from "./nl";
import { PRODUCT_TEXT_PT } from "./pt";

/**
 * Translated product text (titles, descriptions, specs, colour and paper-type
 * names) for every language but English, which always comes from the database.
 *
 * Product text is data, not interface copy, so it lives here rather than in
 * `src/i18n/messages`: it is never parsed as ICU. Use it only when rendering:
 * the English values stay in every cache, store and payload.
 *
 * Server code only: this imports every language. Client code uses
 * `useProductText()`, which loads just the visitor's language.
 *
 * To add or fix a translation, edit `pt.ts` / `nl.ts` with the `source` hashes
 * from `npm run i18n:check-products -- --inventory`, then rerun the check.
 */
export const PRODUCT_TEXT: ProductTextByLocaleT = {
  pt: PRODUCT_TEXT_PT,
  nl: PRODUCT_TEXT_NL,
};

/** The locale's product text; English and unknown locales have none */
export function productTextFor(locale: string): ProductTextT | null {
  return Object.hasOwn(PRODUCT_TEXT, locale) ? PRODUCT_TEXT[locale as keyof ProductTextByLocaleT] : null;
}
