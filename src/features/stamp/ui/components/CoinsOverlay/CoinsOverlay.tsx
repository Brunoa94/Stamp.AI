"use client";

import { NotLoggedInOverlay } from "./NotLoggedInOverlay";
import { NoCoinsOverlay } from "./NoCoinsOverlay";

/**
 * CoinsOverlay
 *
 * Overlay shown when the user cannot generate:
 * - "not-logged-in": needs to authenticate (opens modal dialogs)
 * - "no-coins": exhausted daily coins (with skip option)
 *
 * Thin dispatcher — the variants live in NotLoggedInOverlay / NoCoinsOverlay
 * on top of the shared CoinsOverlayShell.
 */

interface CoinsOverlayProps {
  variant: "not-logged-in" | "no-coins";
  onSkip?: () => void;
  hasCachedImages?: boolean;
}

export function CoinsOverlay({
  variant,
  onSkip,
  hasCachedImages,
}: CoinsOverlayProps) {
  if (variant === "not-logged-in") {
    return <NotLoggedInOverlay />;
  }
  return <NoCoinsOverlay onSkip={onSkip} hasCachedImages={hasCachedImages} />;
}
