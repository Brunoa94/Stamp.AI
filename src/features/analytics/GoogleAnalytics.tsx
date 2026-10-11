"use client";

import { useEffect } from "react";
import Script from "next/script";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { useAnalyticsConsent } from "./lib/hooks/useAnalyticsConsent";
import {
  buildGtagConsent,
  readConsent,
  type AnalyticsConsentType,
} from "./lib/helpers/consent";
import type { GtagFunctionT } from "./types/analyticsTypes";

/** The consent state last handed to gtag, so only real changes are pushed. */
let appliedConsent: AnalyticsConsentType | null = null;

/**
 * Defines window.gtag (a dataLayer queue). The Consent Mode default is the
 * visitor's stored decision, or denied when there is none: page views queued
 * during hydration must not be sent as denied and then again as granted.
 */
function initGtag(measurementId: string): void {
  if (typeof window.gtag === "function") return;
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const gtag: GtagFunctionT = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag = gtag;
  appliedConsent = readConsent() ?? "denied";
  gtag("consent", "default", buildGtagConsent(appliedConsent));
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: false });
}

/**
 * Google Analytics, gated on the visitor's consent (Consent Mode v2).
 *
 * window.gtag always exists, so events queue in the dataLayer, but gtag.js
 * itself is only loaded once analytics consent is granted: without consent
 * nothing is sent to Google. Renders nothing when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is not set (e.g. local development).
 *
 * `send_page_view` is disabled because page views are tracked on route
 * changes by AnalyticsPageViewTracker.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useAnalyticsConsent();

  useEffect(() => {
    if (!measurementId) return;
    initGtag(measurementId);
    if ((consent === "granted" || consent === "denied") && consent !== appliedConsent) {
      appliedConsent = consent;
      window.gtag?.("consent", "update", buildGtagConsent(consent));
    }
  }, [measurementId, consent]);

  if (!measurementId || consent !== "granted") {
    return null;
  }

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
      onLoad={() => AnalyticsService.flush()}
    />
  );
}
