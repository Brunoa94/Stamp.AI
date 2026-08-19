import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import messages from "@/i18n/messages/en.json";
import { CatalogPageContent } from "../CatalogPageContent";
import type {
  CatalogCategorySectionType,
  CatalogDisplayProductType,
} from "../../lib/types/catalogPageTypes";

function buildProduct(
  overrides: Partial<CatalogDisplayProductType> = {}
): CatalogDisplayProductType {
  return {
    blueprintId: 6,
    name: "Unisex Heavy Cotton Tee",
    category: "tshirt",
    description: "A heavyweight classic tee.",
    specs: ["100% cotton"],
    price: 20,
    isOnSale: false,
    imageUrls: ["https://images.printify.com/1.jpg"],
    availableColors: [],
    ...overrides,
  };
}

const SECTIONS: CatalogCategorySectionType[] = [
  { category: "tshirt", products: [buildProduct()] },
  {
    category: "mug",
    products: [
      buildProduct({ blueprintId: 68, name: "Ceramic Mug", category: "mug" }),
    ],
  },
];

describe("CatalogPageContent", () => {
  it("renders the page heading and intro", () => {
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent(messages.catalog.title);
    expect(screen.getByText(messages.catalog.intro)).toBeInTheDocument();
  });

  it("renders one section per category with its products", () => {
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.categories.tshirt,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.categories.mug,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Ceramic Mug" })
    ).toBeInTheDocument();
  });

  it("renders category navigation linking to each section", () => {
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    const nav = screen.getByRole("navigation", {
      name: messages.catalog.categoryNavAria,
    });
    expect(nav).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(messages.catalog.categories.tshirt),
      })
    ).toHaveAttribute("href", "#category-tshirt");
  });

  it("renders the empty state when there are no sections", () => {
    renderWithIntl(<CatalogPageContent sections={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      messages.catalog.emptyState
    );
  });
});
