import { describe, expect, it } from "vitest";
import {
  countCatalogProducts,
  filterCatalogSections,
} from "../filterCatalogSections";
import { groupCatalogSections } from "../groupCatalogSections";
import type {
  CatalogCategorySectionType,
  CatalogDisplayProductType,
  CatalogFilterStateType,
  CatalogGroupSectionType,
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

const SECTIONS: CatalogGroupSectionType[] = [
  {
    group: "clothing",
    products: [
      buildProduct({ blueprintId: 6, name: "Classic Tee", price: 20 }),
      buildProduct({ blueprintId: 12, name: "Premium Tee", price: 30 }),
    ],
  },
  {
    group: "accessories",
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
  return { group: "all", query: "", sort: "featured", ...overrides };
}

describe("groupCatalogSections", () => {
  it("merges category sections into clothing and accessories groups", () => {
    const categorySections: CatalogCategorySectionType[] = [
      {
        category: "mug",
        products: [
          buildProduct({ blueprintId: 68, name: "Ceramic Mug", category: "mug" }),
        ],
      },
      {
        category: "tshirt",
        products: [buildProduct({ blueprintId: 6, name: "Classic Tee" })],
      },
      {
        category: "hoodie",
        products: [
          buildProduct({ blueprintId: 77, name: "Cozy Hoodie", category: "hoodie" }),
        ],
      },
    ];

    const result = groupCatalogSections(categorySections);

    expect(result.map((section) => section.group)).toEqual([
      "clothing",
      "accessories",
    ]);
    expect(result[0].products.map((p) => p.name)).toEqual([
      "Classic Tee",
      "Cozy Hoodie",
    ]);
    expect(result[1].products.map((p) => p.name)).toEqual(["Ceramic Mug"]);
  });

  it("drops groups without products", () => {
    const result = groupCatalogSections([
      {
        category: "tshirt",
        products: [buildProduct()],
      },
    ]);

    expect(result.map((section) => section.group)).toEqual(["clothing"]);
  });
});

describe("filterCatalogSections", () => {
  it("returns all sections untouched with default filters", () => {
    const result = filterCatalogSections(SECTIONS, buildFilters());

    expect(result).toHaveLength(2);
    expect(result[0].products.map((p) => p.blueprintId)).toEqual([6, 12]);
  });

  it("keeps only the selected group", () => {
    const result = filterCatalogSections(
      SECTIONS,
      buildFilters({ group: "accessories" })
    );

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe("accessories");
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
    expect(byDescription[0].group).toBe("accessories");
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
    const input: CatalogGroupSectionType[] = [
      {
        group: "clothing",
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
