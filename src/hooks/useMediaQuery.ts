"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * useMediaQuery
 *
 * Subscribes to a CSS media query. Returns `fallback` on the server and in
 * environments without matchMedia (e.g. jsdom), so components render a
 * deterministic layout during SSR/tests and correct themselves on hydration.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : fallback;

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}
