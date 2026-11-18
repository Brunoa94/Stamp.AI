import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type LocaleT } from "./locales";
import { mergeMessages } from "./mergeMessages";
import { resolveLocale } from "./resolveLocale";
import defaultMessages from "./messages/en.json";

type MessagesT = typeof defaultMessages;

/** Merged once per locale: the catalogs don't change while the server runs */
const mergedByLocale = new Map<LocaleT, MessagesT>();

/** The locale's messages with English underneath, so an untranslated key shows in English */
async function loadMessages(locale: LocaleT): Promise<MessagesT> {
  if (locale === DEFAULT_LOCALE) return defaultMessages;

  const cached = mergedByLocale.get(locale);
  if (cached) return cached;

  const translation = (await import(`./messages/${locale}.json`)).default;
  const merged = mergeMessages(defaultMessages, translation) as MessagesT;
  mergedByLocale.set(locale, merged);
  return merged;
}

/**
 * next-intl request configuration.
 *
 * No locale-based routing (no `[locale]` segment): every URL serves the
 * visitor's language, chosen from the NEXT_LOCALE cookie (set by the language
 * switcher), else Accept-Language, else English. Reading the cookie makes
 * every page render per request. To add a language, add
 * `messages/<locale>.json` and the code to LOCALES in `locales.ts`; keys it
 * doesn't translate fall back to English.
 */
export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerStore.get("accept-language"),
  );

  return { locale, messages: await loadMessages(locale) };
});
