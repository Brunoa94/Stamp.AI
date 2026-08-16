import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { StampFooter } from "../StampFooter";

describe("StampFooter", () => {
  it("renders all four link column headings as labelled navs", () => {
    renderWithIntl(<StampFooter />);

    for (const column of ["Create", "Support", "Legal", "Follow"]) {
      expect(
        screen.getByRole("navigation", { name: column })
      ).toBeInTheDocument();
    }
  });

  it("links every legal page with the correct href", () => {
    renderWithIntl(<StampFooter />);

    const expected: [string, string][] = [
      ["Terms of Service", "/terms"],
      ["Privacy Policy", "/privacy"],
      ["Cookie Policy", "/cookies"],
      ["Security", "/security"],
      ["FAQ", "/faq"],
      ["Shipping & Delivery", "/shipping"],
      ["Returns & Refunds", "/returns"],
    ];

    for (const [label, href] of expected) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }
  });

  it("contains no dead links", () => {
    renderWithIntl(<StampFooter />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("href", "#");
    }
  });

  it("opens social links in a new tab with rel protection", () => {
    renderWithIntl(<StampFooter />);

    const instagram = screen.getByRole("link", { name: "Instagram" });
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the current year in the copyright line", () => {
    renderWithIntl(<StampFooter />);

    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} Stamp AI`))
    ).toBeInTheDocument();
  });
});
