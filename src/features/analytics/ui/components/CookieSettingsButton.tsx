"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { CONSENT_OPEN_EVENT } from "../../lib/constants/consent";

/** Re-opens the consent banner so the visitor can change or withdraw consent. */
export function CookieSettingsButton() {
  const t = useTranslations("cookieConsent");

  return (
    <Button
      variant="unstyled"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="cursor-pointer text-sm font-semibold text-(--color-stamp-taupe) underline underline-offset-4 transition-colors hover:text-(--color-stamp-chocolate) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
    >
      {t("settings")}
    </Button>
  );
}
