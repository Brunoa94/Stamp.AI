import type { ProductGroup } from "../helpers/productCategoryDetector";
import type { CatalogProductMappedType } from "./stampTypes";

// One browsable group of the product step (clothing or accessories)
export type StampProductSectionT = {
  group: ProductGroup;
  products: CatalogProductMappedType[];
};
