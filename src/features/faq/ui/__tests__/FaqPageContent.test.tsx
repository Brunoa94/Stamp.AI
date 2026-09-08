import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import messages from "@/i18n/messages/en.json";
import { FaqPageContent } from "../FaqPageContent";
import { FAQ_CATEGORIES } from "../../lib/constants/faqContent";

describe("FaqPageContent", () => {
  it("renders every category heading", () => {
    renderWithIntl(<FaqPageContent />);

    for (const category of FAQ_CATEGORIES) {
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: messages.faq.categories[category.id].heading,
        })
      ).toBeInTheDocument();
    }
  });

  it("renders every question referenced in the content registry", () => {
    renderWithIntl(<FaqPageContent />);

    for (const category of FAQ_CATEGORIES) {
      for (const itemId of category.items) {
        expect(
          screen.getByText(messages.faq.items[itemId].question)
        ).toBeInTheDocument();
      }
    }
  });
});
