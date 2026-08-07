import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { SecureCheckoutNotice } from "../SecureCheckoutNotice";

describe("SecureCheckoutNotice", () => {
  it("lists the Stripe-supported payment methods", () => {
    renderWithIntl(<SecureCheckoutNotice />);
    for (const method of ["Visa", "Mastercard", "Amex", "PayPal", "iDEAL"]) {
      expect(screen.getByText(method)).toBeInTheDocument();
    }
  });

  it("flags iDEAL as coming soon (not yet a live checkout path)", () => {
    renderWithIntl(<SecureCheckoutNotice />);
    // The "Soon" tag renders next to iDEAL only
    const soon = screen.getByText("Soon");
    expect(soon).toBeInTheDocument();
    // The "Soon" tag sits inside the iDEAL badge and nowhere else
    expect(soon.parentElement?.textContent).toContain("iDEAL");
    expect(screen.getByText("Visa").textContent).not.toContain("Soon");
  });
});
