"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY, CONSENT_UPDATED_EVENT } from "../constants/consent";
import { readConsent, type AnalyticsConsentType } from "../helpers/consent";

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CONSENT_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** "unknown" while rendering on the server, null when the visitor has not chosen. */
export function useAnalyticsConsent(): AnalyticsConsentType | null | "unknown" {
  return useSyncExternalStore(subscribe, readConsent, () => "unknown" as const);
}
