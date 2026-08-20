/**
 * Catalog Page Types
 *
 * Display-layer types for the /catalog page. Products are mapped from
 * ProductWithPricing (server cache) into a serializable shape that the
 * client quick-view dialog can consume, then grouped into ordered
 * category sections.
 */

import type { ProductCategory } from "@/features/stamp/lib/helpers/productCategoryDetector";

export type CatalogDisplayProductType = {
  blueprintId: number;
  name: string;
  category: ProductCategory;
  description: string | null;
  specs: string[];
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  discountPercent?: number;
  imageUrls: string[];
  availableColors: string[];
};

export type CatalogCategorySectionType = {
  category: ProductCategory;
  products: CatalogDisplayProductType[];
};

export type CatalogSortOptionType =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export type CatalogCategoryFilterType = ProductCategory | "all";

export type CatalogFilterStateType = {
  category: CatalogCategoryFilterType;
  query: string;
  sort: CatalogSortOptionType;
};
