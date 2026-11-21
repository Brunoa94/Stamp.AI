import type { CatalogProductMappedT, ProductSectionT } from "../types/stampTypes";

/**
 * The product step's sections, apparel first, each pictured by its first
 * product photo. A section without products is left out of the picker.
 */
export function buildProductSections(
  clothingProducts: CatalogProductMappedT[],
  accessoryProducts: CatalogProductMappedT[],
): ProductSectionT[] {
  const sections: ProductSectionT[] = [
    { id: "apparel", products: clothingProducts, imageUrl: null },
    { id: "accessories", products: accessoryProducts, imageUrl: null },
  ];

  return sections
    .filter((section) => section.products.length > 0)
    .map((section) => ({
      ...section,
      imageUrl: section.products.find((product) => product.imageUrl)?.imageUrl ?? null,
    }));
}
