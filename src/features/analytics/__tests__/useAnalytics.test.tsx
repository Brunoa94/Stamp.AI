import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { AnalyticsService } from "@/services/analyticsService";

describe("useAnalytics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("trackEvent delegates to AnalyticsService.track", () => {
    const trackSpy = vi
      .spyOn(AnalyticsService, "track")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useAnalytics());
    result.current.trackEvent("add_to_cart", { value: 19.99 });

    expect(trackSpy).toHaveBeenCalledWith("add_to_cart", { value: 19.99 });
  });

  it("trackPageView delegates to AnalyticsService.pageView", () => {
    const pageViewSpy = vi
      .spyOn(AnalyticsService, "pageView")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useAnalytics());
    result.current.trackPageView("/cart");

    expect(pageViewSpy).toHaveBeenCalledWith("/cart");
  });

  it("returns stable callbacks across re-renders", () => {
    const { result, rerender } = renderHook(() => useAnalytics());
    const firstRender = result.current;

    rerender();

    expect(result.current.trackEvent).toBe(firstRender.trackEvent);
    expect(result.current.trackPageView).toBe(firstRender.trackPageView);
  });
});
