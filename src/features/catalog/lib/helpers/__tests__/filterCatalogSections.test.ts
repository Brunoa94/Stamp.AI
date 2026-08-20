import { describe, expect, it } from "vitest";
import {
  countCatalogProducts,
  filterCatalogSections,
} from "../filterCatalogSections";
import type {
  CatalogCategorySectionType,
  CatalogDisplayProductType,
  CatalogFilterStateType,
} from "../../types/catalogPageTypes";

function buildProduct(
  overrides: Partial<CatalogDisplayProductType> = {}
): CatalogDisplayProductType {
  return {
    blueprintId: 6,
    name: "Unisex Heavy Cotton Tee",
    category: "tshirt",
    description: "A heavyweight classic tee.",
    specs: [],
    price: 20,
    isOnSale: false,
    imageUrls: [],
    availableColors: [],
    ...overrides,
  };
}

const SECTIONS: CatalogCategorySectionType[] = [
  {
    category: "tshirt",
    products: [
      buildProduct({ blueprintId: 6, name: "Classic Tee", price: 20 }),
      buildProduct({ blueprintId: 12, name: "Premium Tee", price: 30 }),
    ],
  },
  {
    category: "mug",
    products: [
      buildProduct({
        blueprintId: 68,
        name: "Ceramic Mug",
        category: "mug",
        description: "An accent mug for coffee.",
        price: 15,
      }),
    ],
  },
];

function buildFilters(
  overrides: Partial<CatalogFilterStateType> = {}
): CatalogFilterStateType {
  return { category: "all", query: "", sort: "featured", ...overrides };
}

describe("filterCatalogSections", () => {
  it("returns all sections untouched with default filters", () => {
    const result = filterCatalogSections(SECTIONS, buildFilters());

    expect(result).toHaveLength(2);
    expect(result[0].products.map((p) => p.blueprintId)).toEqual([6, 12]);
  });

  it("keeps only the selected category", () => {
    const result = filterCatalogSections(
      SECTIONS,
      buildFilters({ category: "mug" })
    );

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("mug");
  });

  it("matches the query against name and description, ignoring case", () => {
    const byName = filterCatalogSections(
      SECTIONS,
      buildFilters({ query: "  PREMIUM " })
    );
    expect(byName).toHaveLength(1);
    expect(byName[0].products.map((p) => p.name)).toEqual(["Premium Tee"]);

    const byDescription = filterCatalogSections(
      SECTIONS,
      buildFilters({ query: "coffee" })
    );
    expect(byDescription).toHaveLength(1);
    expect(byDescription[0].category).toBe("mug");
  });

  it("drops sections left without products", () => {
    const result = filterCatalogSections(
      SECTIONS,
      buildFilters({ query: "no-such-product" })
    );

    expect(result).toHaveLength(0);
  });

  it("sorts products by price in both directions", () => {
    const ascending = filterCatalogSections(
      SECTIONS,
      buildFilters({ sort: "price-asc" })
    );
    expect(ascending[0].products.map((p) => p.price)).toEqual([20, 30]);

    const descending = filterCatalogSections(
      SECTIONS,
      buildFilters({ sort: "price-desc" })
    );
    expect(descending[0].products.map((p) => p.price)).toEqual([30, 20]);
  });

  it("sorts products by name without mutating the input", () => {
    const input: CatalogCategorySectionType[] = [
      {
        category: "tshirt",
        products: [
          buildProduct({ blueprintId: 12, name: "Premium Tee" }),
          buildProduct({ blueprintId: 6, name: "Classic Tee" }),
        ],
      },
    ];

    const result = filterCatalogSections(
      input,
      buildFilters({ sort: "name-asc" })
    );

    expect(result[0].products.map((p) => p.name)).toEqual([
      "Classic Tee",
      "Premium Tee",
    ]);
    expect(input[0].products.map((p) => p.name)).toEqual([
      "Premium Tee",
      "Classic Tee",
    ]);
  });
});

describe("countCatalogProducts", () => {
  it("sums products across sections", () => {
    expect(countCatalogProducts(SECTIONS)).toBe(3);
    expect(countCatalogProducts([])).toBe(0);
  });
});
