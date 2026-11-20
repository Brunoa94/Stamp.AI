import { DEFAULT_LOCALE, isLocale, type LocaleT } from "./locales";

/** "pt-BR;q=0.8" → { language: "pt", quality: 0.8 } */
function parseLanguageRange(range: string): { language: string; quality: number } {
  const [tag, ...params] = range.trim().split(";");
  const qParam = params.find((param) => param.trim().startsWith("q="));
  const quality = qParam ? Number(qParam.trim().slice(2)) : 1;

  return {
    language: tag.trim().split("-")[0].toLowerCase(),
    quality: Number.isNaN(quality) ? 0 : quality,
  };
}

/**
 * The visitor's language: their saved choice (cookie) when it is one we
 * support, else the best supported match in Accept-Language, else English.
 */
export function resolveLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string | null,
): LocaleT {
  if (isLocale(cookieLocale)) return cookieLocale;

  const preferred = (acceptLanguage ?? "")
    .split(",")
    .filter((range) => range.trim())
    .map(parseLanguageRange)
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .find(({ language }) => isLocale(language));

  return preferred && isLocale(preferred.language) ? preferred.language : DEFAULT_LOCALE;
}
