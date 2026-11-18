/** Languages the site is translated into; each has `messages/<locale>.json` */
export const LOCALES = ["en", "pt", "nl"] as const;

export type LocaleT = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleT = "en";

/** Each language in its own words, so visitors find theirs whatever is showing */
export const LOCALE_NAMES: Record<LocaleT, string> = {
  en: "English",
  pt: "Português",
  nl: "Nederlands",
};

/** next-intl's conventional cookie name for the visitor's chosen language */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** A year: the choice should outlive the session */
export const LOCALE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

export const isLocale = (value: unknown): value is LocaleT =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** The regional BCP 47 tag each locale is written in, for structured data */
const LANGUAGE_TAGS: Record<LocaleT, string> = {
  en: "en-US",
  pt: "pt-PT",
  nl: "nl-NL",
};

/** "pt" → "pt-PT"; anything unsupported → the default locale's tag */
export const toLanguageTag = (locale: string): string =>
  LANGUAGE_TAGS[isLocale(locale) ? locale : DEFAULT_LOCALE];
