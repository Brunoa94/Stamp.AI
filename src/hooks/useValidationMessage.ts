import { useTranslations } from "next-intl";

/**
 * Resolves a zod validation message into localized copy.
 *
 * Our zod schemas store i18n keys (under the `validation` namespace) as their
 * `message`, rather than English text — see src/schemas/*. Form components call
 * the returned function with `errors.<field>?.message` to render the localized
 * error, or `undefined` when the field is valid.
 */
export function useValidationMessage() {
  const t = useTranslations("validation");
  return (key?: string): string | undefined => (key ? t(key) : undefined);
}
