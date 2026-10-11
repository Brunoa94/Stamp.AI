"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsService } from "@/shared/services/analyticsService";

/**
 * The path of the last page view sent, kept outside the component so a
 * remount on the same route (React StrictMode runs mount effects twice in
 * development) does not send the page view again.
 */
let lastTrackedPath: string | null = null;

/** Tracks a GA4 page_view on every client-side route change. */
export function AnalyticsPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === lastTrackedPath) return;
    lastTrackedPath = pathname;
    AnalyticsService.pageView(pathname);
  }, [pathname]);

  return null;
}
