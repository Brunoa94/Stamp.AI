"use client";

import { useCallback } from "react";
import { AnalyticsService } from "@/services/analyticsService";
import type {
  AnalyticsEventNameT,
  AnalyticsEventParamsT,
} from "@/features/analytics/types/analyticsTypes";

/** Component-level access to the analytics service with stable callbacks. */
export function useAnalytics() {
  const trackEvent = useCallback(
    (name: AnalyticsEventNameT, params?: AnalyticsEventParamsT) => {
      AnalyticsService.track(name, params);
    },
    [],
  );

  const trackPageView = useCallback((path: string) => {
    AnalyticsService.pageView(path);
  }, []);

  return { trackEvent, trackPageView };
}
