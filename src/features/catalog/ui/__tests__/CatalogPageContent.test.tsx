import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders one section per group with its products", () => {
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.groups.clothing,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.groups.accessories,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Ceramic Mug" })
    ).toBeInTheDocument();
  });

  it("renders the group filter with all products selected", () => {
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    expect(
      screen.getByRole("combobox", {
        name: messages.catalog.categoryNavAria,
      })
    ).toHaveTextContent(messages.catalog.allCategory);
  });

  it("narrows the grid to the selected group", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    await user.click(
      screen.getByRole("combobox", {
        name: messages.catalog.categoryNavAria,
      })
    );
    await user.click(
      screen.getByRole("option", {
        name: messages.catalog.groups.accessories,
      })
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.groups.accessories,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: messages.catalog.groups.clothing,
      })
    ).not.toBeInTheDocument();
  });

  it("narrows the grid from a showcase group card", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.catalog.showcase.title,
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: `Browse ${messages.catalog.groups.accessories}`,
      })
    );

    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: messages.catalog.showcase.title,
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: messages.catalog.groups.clothing,
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Ceramic Mug" })
    ).toBeInTheDocument();
  });

  it("filters products by search query", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: messages.catalog.toolbar.searchAria,
      }),
      "ceramic"
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Ceramic Mug" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 3,
        name: "Unisex Heavy Cotton Tee",
      })
    ).not.toBeInTheDocument();
  });

  it("shows the no-results state and clears filters from it", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CatalogPageContent sections={SECTIONS} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: messages.catalog.toolbar.searchAria,
      }),
      "no-such-product"
    );

    expect(
      screen.getByText(messages.catalog.noResults.title)
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("status")).getByRole("button", {
        name: messages.catalog.noResults.clearFilters,
      })
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Ceramic Mug" })
    ).toBeInTheDocument();
  });

  it("renders the empty state when there are no sections", () => {
    renderWithIntl(<CatalogPageContent sections={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      messages.catalog.emptyState
    );
  });
});
