import { StrictMode } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

/** Fresh modules per test: the tracker remembers the last path at module level. */
async function loadTracker() {
  vi.resetModules();
  const { AnalyticsService } = await import("@/shared/services/analyticsService");
  const pageView = vi.spyOn(AnalyticsService, "pageView").mockImplementation(() => {});
  const { AnalyticsPageViewTracker } = await import("../AnalyticsPageViewTracker");
  return { AnalyticsPageViewTracker, pageView };
}

describe("AnalyticsPageViewTracker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigation.pathname = "/";
  });

  it("sends one page view per route, even when StrictMode runs effects twice", async () => {
    const { AnalyticsPageViewTracker, pageView } = await loadTracker();
    const { rerender } = render(<StrictMode><AnalyticsPageViewTracker /></StrictMode>);
    expect(pageView.mock.calls).toEqual([["/"]]);

    navigation.pathname = "/catalog";
    rerender(<StrictMode><AnalyticsPageViewTracker /></StrictMode>);
    expect(pageView.mock.calls).toEqual([["/"], ["/catalog"]]);
  });

  it("tracks a return to a previously visited route", async () => {
    const { AnalyticsPageViewTracker, pageView } = await loadTracker();
    const { rerender } = render(<AnalyticsPageViewTracker />);
    navigation.pathname = "/catalog";
    rerender(<AnalyticsPageViewTracker />);
    navigation.pathname = "/";
    rerender(<AnalyticsPageViewTracker />);
    expect(pageView.mock.calls).toEqual([["/"], ["/catalog"], ["/"]]);
  });
});
