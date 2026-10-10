import { describe, expect, it } from "vitest";
import {
  detectProductCategory,
  getVariantOptionKind,
  shouldShowColorSelection,
} from "../productCategoryDetector";

// Active production catalog titles (tests/acceptance/catalog-snapshot.json).
const CATALOG = [
  { title: "Unisex Softstyle T-Shirt", category: "tshirt", colors: true },
  { title: "Kids Heavy Cotton™ Tee", category: "tshirt", colors: true },
  { title: "Spun Polyester Square Pillowcase", category: "pillow", colors: false },
  { title: "Ceramic Mug (EU)", category: "mug", colors: false },
  { title: "Spiral Journal (EU)", category: "notebook", colors: true },
  { title: "Sublimation Crew Socks (EU)", category: "socks", colors: false },
  { title: 'Matte Canvas, Stretched, 1.25"', category: "canvas", colors: false },
  { title: "Tote Bag (AOP)", category: "totebag", colors: true },
  { title: "Unisex Midweight Softstyle Fleece Hoodie", category: "hoodie", colors: true },
];

describe("detectProductCategory", () => {
  it.each(CATALOG)("detects $title as $category", ({ title, category }) => {
    expect(detectProductCategory(title)).toBe(category);
  });

  it("does not treat a pillowcase as a phone case", () => {
    expect(detectProductCategory("Pillow Case")).toBe("pillow");
    expect(detectProductCategory("Tough iPhone Case")).toBe("phone-case");
  });
});

describe("getVariantOptionKind", () => {
  it("offers notebooks a paper type and everything else a color", () => {
    expect(getVariantOptionKind("Spiral Journal (EU)")).toBe("paperType");
    expect(getVariantOptionKind("Unisex Softstyle T-Shirt")).toBe("color");
  });
});

describe("shouldShowColorSelection", () => {
  it.each(CATALOG)("shows colors for $title: $colors", ({ title, colors }) => {
    expect(shouldShowColorSelection(title)).toBe(colors);
  });
});
