import { describe, expect, it } from "vitest";
import { groupProductsByCategory } from "../groupProductsByCategory";
import type { CatalogDisplayProductType } from "../../types/catalogPageTypes";
import type { ProductCategory } from "@/features/stamp/lib/helpers/productCategoryDetector";

function buildProduct(
  blueprintId: number,
  category: ProductCategory
): CatalogDisplayProductType {
  return {
    blueprintId,
    name: `Product ${blueprintId}`,
    category,
    description: null,
    specs: [],
    price: 25,
    isOnSale: false,
    imageUrls: [],
    availableColors: [],
  };
}

describe("groupProductsByCategory", () => {
  it("groups products into sections by category", () => {
    const sections = groupProductsByCategory([
      buildProduct(1, "tshirt"),
      buildProduct(2, "mug"),
      buildProduct(3, "tshirt"),
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[0].category).toBe("tshirt");
    expect(sections[0].products.map((p) => p.blueprintId)).toEqual([1, 3]);
    expect(sections[1].category).toBe("mug");
  });

  it("omits categories without products", () => {
    const sections = groupProductsByCategory([buildProduct(1, "hoodie")]);

    expect(sections).toHaveLength(1);
    expect(sections[0].category).toBe("hoodie");
  });

  it("orders apparel before accessories and other last", () => {
    const sections = groupProductsByCategory([
      buildProduct(1, "other"),
      buildProduct(2, "mug"),
      buildProduct(3, "hoodie"),
    ]);

    expect(sections.map((s) => s.category)).toEqual([
      "hoodie",
      "mug",
      "other",
    ]);
  });

  it("returns no sections for an empty product list", () => {
    expect(groupProductsByCategory([])).toEqual([]);
  });
});
