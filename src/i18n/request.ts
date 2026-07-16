import { getRequestConfig } from "next-intl/server";

/**
 * next-intl request configuration.
 *
 * The app is currently single-locale (English). We deliberately do NOT use
 * locale-based routing (no `[locale]` segment, no middleware changes) — the
 * locale is fixed here. To add more languages later:
 *   1. Add `src/i18n/messages/<locale>.json`
 *   2. Introduce locale detection (cookie/header or routing) and return the
 *      resolved locale below instead of the hardcoded default.
 */
export const DEFAULT_LOCALE = "en" as const;

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
