"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { CONSENT_OPEN_EVENT } from "../lib/constants/consent";

/** Re-opens the consent banner so the visitor can change or withdraw consent. */
export function CookieSettingsButton() {
  const t = useTranslations("cookieConsent");

  return (
    <Button
      variant="unstyled"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="cursor-pointer text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-chocolate)/50 transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
    >
      {t("settings")}
    </Button>
  );
}
