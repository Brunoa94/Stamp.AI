"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { AnalyticsService } from "@/services/analyticsService";
import {
  buildConsentDefaultArgs,
  buildConsentUpdateArgs,
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  readConsentFromCookieHeader,
  type ConsentStateType,
} from "./lib/consent";

/**
 * Consent-gated gtag.js loader (Google Consent Mode v2).
 *
 * - Always queues `consent default` (everything denied) BEFORE `config` so the
 *   first thing gtag.js processes, if it ever loads, is the denied baseline.
 * - Does not load gtag.js, and does not expose `window.gtag`, until the
 *   consent cookie grants `analytics_storage`. Events tracked meanwhile stay in
 *   AnalyticsService's in-memory queue and are flushed on load.
 * - Re-reads the cookie when the (pending) banner dispatches
 *   CONSENT_UPDATED_EVENT, so granting consent does not need a reload.
 *
 * Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.
 * `send_page_view` is disabled because page views are tracked on route
 * changes by AnalyticsPageViewTracker.
 */

function readStoredConsent(): ConsentStateType | null {
  return readConsentFromCookieHeader(document.cookie);
}

function pushConsentUpdate(state: ConsentStateType): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    // Google's snippet pushes the `arguments` object, not an array.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
  window.gtag(...buildConsentUpdateArgs(state));
}

function buildInitScript(measurementId: string): string {
  const [, , defaultParams] = buildConsentDefaultArgs();
  return `
    window.dataLayer = window.dataLayer || [];
    function gtagQueue(){dataLayer.push(arguments);}
    gtagQueue('consent','default', ${JSON.stringify(defaultParams)});
    gtagQueue('js', new Date());
    gtagQueue('config', '${measurementId}', { send_page_view: false });
  `;
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [analyticsGranted, setAnalyticsGranted] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    const syncConsent = () => {
      const state = readStoredConsent();
      const granted = hasAnalyticsConsent(state);
      if (state && (granted || typeof window.gtag === "function")) {
        pushConsentUpdate(state);
      }
      setAnalyticsGranted(granted);
    };

    syncConsent();
    window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent);
  }, [measurementId]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script id="google-analytics-init" strategy="afterInteractive">
        {buildInitScript(measurementId)}
      </Script>
      {analyticsGranted && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          onLoad={() => AnalyticsService.flush()}
        />
      )}
    </>
  );
}
