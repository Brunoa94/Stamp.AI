import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { SecureCheckoutNotice } from "../SecureCheckoutNotice";

describe("SecureCheckoutNotice", () => {
  it("lists the supported payment methods", () => {
    renderWithIntl(<SecureCheckoutNotice />);
    for (const method of ["Visa", "Mastercard", "American Express", "PayPal", "iDEAL"]) {
      expect(screen.getByRole("img", { name: method })).toBeInTheDocument();
    }
  });
});
