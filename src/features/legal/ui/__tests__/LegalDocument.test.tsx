import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import messages from "@/i18n/messages/en.json";
import { LegalDocument } from "../LegalDocument";
import {
  LEGAL_PAGE_KEYS,
  type LegalPageKeyType,
} from "../../lib/constants/legalPages";
import { LEGAL_ENTITY } from "../../lib/constants/legalEntity";

type SectionMessages = {
  heading: string;
  body: string[];
  bullets?: string[];
};

function sectionsOf(pageKey: LegalPageKeyType): Record<string, SectionMessages> {
  return messages.legal[pageKey].sections as Record<string, SectionMessages>;
}

describe("LegalDocument", () => {
  it.each(LEGAL_PAGE_KEYS)(
    "renders every section heading of the %s document",
    (pageKey) => {
      renderWithIntl(<LegalDocument pageKey={pageKey} />);

      for (const section of Object.values(sectionsOf(pageKey))) {
        expect(
          screen.getByRole("heading", { level: 2, name: section.heading })
        ).toBeInTheDocument();
      }
    }
  );

  it("renders body paragraphs and bullet lists", () => {
    renderWithIntl(<LegalDocument pageKey="returns" />);

    // A body paragraph without placeholders renders verbatim
    expect(
      screen.getByText(/tell us within 30 days of delivery/i)
    ).toBeInTheDocument();

    // A bullet from the "what-is-covered" list
    expect(
      screen.getByText(/The wrong item, size or colour arriving\./)
    ).toBeInTheDocument();
  });

  it("interpolates entity placeholders instead of printing them raw", () => {
    renderWithIntl(<LegalDocument pageKey="terms" />);

    expect(
      screen.getAllByText(new RegExp(LEGAL_ENTITY.legalName)).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/\{legalName\}/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\{supportEmail\}/)).not.toBeInTheDocument();
  });

  it("renders exactly one h1 with the document title", () => {
    renderWithIntl(<LegalDocument pageKey="privacy" />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/privacy/i);
  });
});
