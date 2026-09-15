import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "../GoogleAnalytics";
import {
  ALL_DENIED_CONSENT,
  CONSENT_COOKIE_NAME,
  CONSENT_UPDATED_EVENT,
  serializeConsentCookie,
} from "../lib/consent";

vi.mock("next/script", () => ({
  default: ({
    src,
    id,
    children,
  }: {
    src?: string;
    id?: string;
    children?: ReactNode;
  }) => (
    <script data-testid="script" data-src={src} id={id}>
      {children}
    </script>
  ),
}));

const GRANTED_COOKIE = serializeConsentCookie({
  ...ALL_DENIED_CONSENT,
  analytics_storage: "granted",
});

function scripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll("script"));
}

function gtagScript(container: HTMLElement) {
  return scripts(container).find((s) =>
    s.dataset.src?.includes("googletagmanager.com/gtag/js"),
  );
}

function clearConsentCookie() {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    clearConsentCookie();
    delete window.gtag;
    delete window.dataLayer;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    clearConsentCookie();
  });

  it("renders nothing without a measurement id", () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const { container } = render(<GoogleAnalytics />);
    expect(scripts(container)).toHaveLength(0);
  });

  it("does not load gtag.js and does not expose window.gtag without consent", () => {
    const { container } = render(<GoogleAnalytics />);
    expect(gtagScript(container)).toBeUndefined();
    expect(window.gtag).toBeUndefined();
  });

  it("emits an all-denied consent default before the config command", () => {
    const { container } = render(<GoogleAnalytics />);
    const init = container.querySelector("#google-analytics-init");
    const code = init?.textContent ?? "";

    const defaultIndex = code.indexOf("'consent','default'");
    const configIndex = code.indexOf("'config'");
    expect(defaultIndex).toBeGreaterThan(-1);
    expect(configIndex).toBeGreaterThan(defaultIndex);
    expect(code).toContain('"analytics_storage":"denied"');
    expect(code).toContain('"ad_storage":"denied"');
    expect(code).toContain('"ad_user_data":"denied"');
    expect(code).toContain('"ad_personalization":"denied"');
    expect(code).not.toContain("window.gtag");
  });

  it("loads gtag.js when the consent cookie grants analytics_storage", () => {
    document.cookie = `${CONSENT_COOKIE_NAME}=${GRANTED_COOKIE}; Path=/`;
    const { container } = render(<GoogleAnalytics />);

    expect(gtagScript(container)?.dataset.src).toContain("id=G-TEST123");
    expect(typeof window.gtag).toBe("function");
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          0: "consent",
          1: "update",
          2: expect.objectContaining({ analytics_storage: "granted" }),
        }),
      ]),
    );
  });

  it("starts loading once the banner dispatches the consent-updated event", () => {
    const { container } = render(<GoogleAnalytics />);
    expect(gtagScript(container)).toBeUndefined();

    act(() => {
      document.cookie = `${CONSENT_COOKIE_NAME}=${GRANTED_COOKIE}; Path=/`;
      window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
    });

    expect(gtagScript(container)).toBeDefined();
    expect(typeof window.gtag).toBe("function");
  });
});
