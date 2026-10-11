import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";
import messages from "@/i18n/messages/en.json";
import { CookieConsentBanner } from "../CookieConsentBanner";
import { CookieSettingsButton } from "../CookieSettingsButton";
import { readConsent } from "../../lib/helpers/consent";

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <CookieConsentBanner />
      <CookieSettingsButton />
    </NextIntlClientProvider>,
  );
}

describe("CookieConsentBanner", () => {
  beforeEach(() => window.localStorage.clear());

  it("asks until the visitor decides and stores the choice", () => {
    renderBanner();
    expect(screen.getByRole("region", { name: /cookies/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cookie policy/i })).toHaveAttribute("href", "/cookies");

    fireEvent.click(screen.getByRole("button", { name: /essential only/i }));

    expect(readConsent()).toBe("denied");
    expect(screen.queryByRole("region", { name: /cookies/i })).not.toBeInTheDocument();
  });

  it("stays hidden after a decision and reopens from Cookie settings", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: /accept analytics/i }));
    expect(screen.queryByRole("region", { name: /cookies/i })).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /cookie settings/i }));
    });
    expect(screen.getByRole("region", { name: /cookies/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept analytics/i })).toHaveFocus();
  });
});
