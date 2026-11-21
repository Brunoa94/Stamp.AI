import type { ProductTextT, TranslatedLocaleT } from "@/shared/types/productText";

/** One import() per language, so the browser downloads only the visitor's file */
const LOADERS: Record<TranslatedLocaleT, () => Promise<ProductTextT>> = {
  pt: () => import("./pt").then((module) => module.PRODUCT_TEXT_PT),
  nl: () => import("./nl").then((module) => module.PRODUCT_TEXT_NL),
};

export const isTranslatedLocale = (locale: string): locale is TranslatedLocaleT =>
  Object.hasOwn(LOADERS, locale);

/** The locale's product text, loaded on demand; English has none */
export function loadProductText(locale: string): Promise<ProductTextT | null> {
  return isTranslatedLocale(locale) ? LOADERS[locale]() : Promise.resolve(null);
}
