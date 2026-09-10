import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { SecureCheckoutNotice } from "../SecureCheckoutNotice";

describe("SecureCheckoutNotice", () => {
  it("lists the supported payment methods", () => {
    renderWithIntl(<SecureCheckoutNotice />);
    for (const method of ["Visa", "Mastercard", "Amex", "PayPal", "iDEAL"]) {
      expect(screen.getByText(method)).toBeInTheDocument();
    }
  });

  it("presents all payment methods as live (no coming-soon tags)", () => {
    renderWithIntl(<SecureCheckoutNotice />);
    expect(screen.queryByText("Soon")).not.toBeInTheDocument();
  });
});
