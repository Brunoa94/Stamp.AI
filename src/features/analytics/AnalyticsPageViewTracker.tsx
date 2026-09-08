"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsService } from "@/services/analyticsService";

/** Tracks a GA4 page_view on every client-side route change. */
export function AnalyticsPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    AnalyticsService.pageView(pathname);
  }, [pathname]);

  return null;
}
