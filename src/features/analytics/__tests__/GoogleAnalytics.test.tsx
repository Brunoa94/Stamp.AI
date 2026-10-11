import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "../GoogleAnalytics";
import { writeConsent } from "../lib/helpers/consent";

vi.mock("next/script", () => ({
  default: ({ src }: { src: string }) => <script data-testid="gtag-js" data-src={src} />,
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST");
    window.localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
  });
  afterEach(() => vi.unstubAllEnvs());

  it("queues events with consent denied by default and does not load gtag.js", () => {
    const { queryByTestId } = render(<GoogleAnalytics />);
    expect(queryByTestId("gtag-js")).toBeNull();
    expect(typeof window.gtag).toBe("function");
    const [command, mode, state] = Array.from(window.dataLayer![0] as ArrayLike<unknown>);
    expect([command, mode]).toEqual(["consent", "default"]);
    expect(state).toMatchObject({ analytics_storage: "denied", ad_storage: "denied" });
  });

  it("loads gtag.js and updates consent once analytics is accepted", () => {
    const { queryByTestId } = render(<GoogleAnalytics />);
    act(() => writeConsent("granted"));
    expect(queryByTestId("gtag-js")).toHaveAttribute("data-src", expect.stringContaining("id=G-TEST"));
    const updates = window.dataLayer!.map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter(([command, mode]) => command === "consent" && mode === "update");
    expect(updates.at(-1)?.[2]).toMatchObject({ analytics_storage: "granted" });
  });

  it("starts from a stored grant so queued page views are never sent as denied (GA-01)", () => {
    writeConsent("granted");
    const { queryByTestId } = render(<GoogleAnalytics />);

    const entries = window.dataLayer!.map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(entries[0]).toEqual(["consent", "default", expect.objectContaining({ analytics_storage: "granted" })]);
    // No denied -> granted switch, which makes gtag send a page view twice.
    expect(entries.filter(([command, mode]) => command === "consent" && mode === "update")).toEqual([]);
    expect(queryByTestId("gtag-js")).not.toBeNull();
  });

  it("renders nothing without a measurement id", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    render(<GoogleAnalytics />);
    expect(window.gtag).toBeUndefined();
  });
});
