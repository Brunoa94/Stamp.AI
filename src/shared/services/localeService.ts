import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_S,
} from "@/i18n/locales";
import { ErrorClient } from "./errorClient";

/**
 * LocaleService
 *
 * Saves the visitor's language choice in the cookie `src/i18n/request.ts`
 * reads, so the next server render uses it.
 */
export const LocaleService = {
  async save(locale: string): Promise<void> {
    if (!isLocale(locale)) {
      throw ErrorClient.handleError({
        error: new Error(`Unsupported locale: ${locale}`),
        service: "Locale",
        action: "Save Locale",
      });
    }

    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_S}; samesite=lax`;
  },
};
