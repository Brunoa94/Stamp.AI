"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { CONSENT_OPEN_EVENT } from "../lib/constants/consent";
import { writeConsent, type AnalyticsConsentType } from "../lib/helpers/consent";
import { useAnalyticsConsent } from "../lib/hooks/useAnalyticsConsent";

/**
 * Asks for analytics consent until the visitor decides, and again when they
 * open "Cookie settings". Non-modal: the page stays usable, and Google
 * Analytics is not loaded until "Accept analytics" is chosen.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const consent = useAnalyticsConsent();
  const [reopened, setReopened] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    // Opened on request: move focus into the banner for keyboard users.
    if (reopened) acceptRef.current?.focus();
  }, [reopened]);

  if (consent === "unknown" || (consent !== null && !reopened)) return null;

  const decide = (analytics: AnalyticsConsentType) => {
    writeConsent(analytics);
    setReopened(false);
  };

  return (
    <section
      aria-label={t("title")}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-4 shadow-(--shadow-stamp-card-hover) sm:p-6 md:right-auto md:left-6"
    >
      <Span as="div" variant="label" className="text-(--color-stamp-gold-text)">
        {t("title")}
      </Span>
      <Paragraph variant="xs" className="mt-2 text-(--color-stamp-chocolate)">
        {t("body")}{" "}
        <Link
          href="/cookies"
          className="font-semibold underline underline-offset-4 hover:text-(--color-stamp-gold-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
        >
          {t("policyLink")}
        </Link>
      </Paragraph>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button ref={acceptRef} variant="primary-compact" onClick={() => decide("granted")}>
          {t("accept")}
        </Button>
        <Button variant="secondary-compact" onClick={() => decide("denied")}>
          {t("reject")}
        </Button>
      </div>
    </section>
  );
}
