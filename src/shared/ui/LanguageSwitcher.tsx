"use client";

import { useLocale, useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/ui/select";
import { Span } from "@/features/ui/span";
import { DEFAULT_LOCALE, isLocale, LOCALE_NAMES, LOCALES } from "@/i18n/locales";
import { useSetLocale } from "@/shared/queries/localeQueries";
import { LocaleFlag } from "@/shared/ui/LocaleFlag";
import { cn } from "@/lib/utils";

interface PropsI {
  className?: string;
}

/**
 * LanguageSwitcher
 *
 * Dropdown that picks the site language. The trigger shows the current
 * language's flag and short code; the menu lists each language with its flag
 * and its own name. The choice shows straight away, and the dropdown stays
 * disabled and busy until the page has re-rendered in that language.
 */
export function LanguageSwitcher({ className }: PropsI) {
  const t = useTranslations("layout.languageSwitcher");
  const locale = useLocale();
  const { switchLocale, isSwitching, pendingLocale } = useSetLocale();
  const wantedLocale = pendingLocale ?? locale;
  const shownLocale = isLocale(wantedLocale) ? wantedLocale : DEFAULT_LOCALE;

  return (
    <Select
      value={shownLocale}
      onValueChange={(code) => isLocale(code) && code !== shownLocale && switchLocale(code)}
      disabled={isSwitching}
    >
      <SelectTrigger
        aria-label={`${t("label")}: ${LOCALE_NAMES[shownLocale]}`}
        aria-busy={isSwitching}
        className={cn(
          "h-auto w-auto gap-2 rounded-sm border-0 bg-transparent px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-none ring-offset-0 transition-colors hover:text-(--color-stamp-gold) focus:ring-2 focus:ring-(--color-stamp-gold) focus:ring-offset-0 disabled:opacity-60",
          className,
        )}
      >
        <SelectValue>
          <Span unstyled className="flex items-center gap-2">
            <LocaleFlag locale={shownLocale} />
            {shownLocale}
          </Span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        className="min-w-40 rounded-sm border-(--color-stamp-divider) bg-(--color-stamp-off-white) text-(--color-stamp-chocolate)"
      >
        {LOCALES.map((code) => (
          <SelectItem
            key={code}
            value={code}
            lang={code}
            className="cursor-pointer text-sm focus:bg-(--color-stamp-cream) focus:text-(--color-stamp-chocolate)"
          >
            <Span unstyled className="flex items-center gap-2.5">
              <LocaleFlag locale={code} />
              {LOCALE_NAMES[code]}
            </Span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
