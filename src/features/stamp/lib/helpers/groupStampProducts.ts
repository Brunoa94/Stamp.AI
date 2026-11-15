/**
 * Stamp Product Groups
 *
 * Splits the product step's catalog into the groups its selector offers:
 * clothing first, then accessories. Product order inside a group follows
 * the catalog order; groups with no products are omitted.
 */

import { isClothingProduct, type ProductGroup } from "./productCategoryDetector";
import type { CatalogProductMappedType } from "../types/stampTypes";
import type { StampProductSectionT } from "../types/productSectionTypes";

const STAMP_PRODUCT_GROUP_ORDER: ProductGroup[] = ["clothing", "accessories"];

export function groupStampProducts(
  products: CatalogProductMappedType[],
): StampProductSectionT[] {
  return STAMP_PRODUCT_GROUP_ORDER.map((group) => ({
    group,
    products: products.filter(
      (product) =>
        (isClothingProduct(product.name) ? "clothing" : "accessories") === group,
    ),
  })).filter((section) => section.products.length > 0);
}
