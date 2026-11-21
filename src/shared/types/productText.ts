import type { LocaleT } from "@/i18n/locales";

/** Hashes of the English text a translation was made from, to detect drift */
type ProductTextSourceT = {
  titleHash: string;
  descriptionHash: string;
};

/** One blueprint's translated fields; a missing field shows the English value */
type ProductTranslationT = {
  title?: string;
  description?: string;
  specs?: string[];
  source: ProductTextSourceT;
};

export type ProductLabelKindT = "color" | "paperType";

/** All product text for one language, keyed by Printify blueprint id */
export type ProductTextT = {
  products: Record<number, ProductTranslationT>;
  /** Keyed by the normalised English value (see normalizeLabelKey) */
  labels: Record<ProductLabelKindT, Record<string, string>>;
};

/** Every language except English, which always comes from the database */
export type TranslatedLocaleT = Exclude<LocaleT, "en">;

export type ProductTextByLocaleT = Record<TranslatedLocaleT, ProductTextT>;

/** The product text a display mapper shows */
export type LocalizedProductTextT = {
  title: string;
  description: string | null;
  specs: string[];
};
