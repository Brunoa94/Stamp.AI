"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { LOCALE_NAMES, LOCALES } from "@/i18n/locales";
import { useSetLocale } from "@/shared/queries/localeQueries";
import { cn } from "@/lib/utils";

interface PropsI {
  className?: string;
}

/**
 * LanguageSwitcher
 *
 * Picks the site language from three short codes (EN · PT · NL). The chosen
 * one shows as pressed straight away, and the group stays disabled and busy
 * until the page has re-rendered in that language.
 */
export function LanguageSwitcher({ className }: PropsI) {
  const t = useTranslations("layout.languageSwitcher");
  const locale = useLocale();
  const { switchLocale, isSwitching, pendingLocale } = useSetLocale();
  const shownLocale = pendingLocale ?? locale;

  return (
    <div
      role="group"
      aria-label={t("label")}
      aria-busy={isSwitching}
      className={cn("flex items-center gap-1", className)}
    >
      {LOCALES.map((code) => (
        <Button
          key={code}
          variant="unstyled"
          lang={code}
          aria-label={`${code.toUpperCase()}, ${LOCALE_NAMES[code]}`}
          aria-pressed={code === shownLocale}
          disabled={isSwitching}
          onClick={() => code !== shownLocale && switchLocale(code)}
          className="rounded-sm px-1.5 py-1 text-xs font-semibold uppercase tracking-wider text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-chocolate) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) disabled:opacity-60 aria-pressed:text-(--color-stamp-chocolate) aria-pressed:underline aria-pressed:decoration-(color:--color-stamp-gold) aria-pressed:decoration-2 aria-pressed:underline-offset-4"
        >
          {code}
        </Button>
      ))}
    </div>
  );
}
