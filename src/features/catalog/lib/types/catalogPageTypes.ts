/**
 * Catalog Page Types
 *
 * Display-layer types for the /catalog page. Products are mapped from
 * ProductWithPricing (server cache) into a serializable shape that the
 * client quick-view dialog can consume, then grouped into ordered
 * category sections by the server and merged client-side into the two
 * browsing groups (clothing, accessories).
 */

import type {
  ProductCategory,
  ProductGroup,
} from "@/shared/helpers/productCategoryDetector";

export type CatalogDisplayProductT = {
  blueprintId: number;
  /** English title, for sorting and category logic; render `displayName` */
  name: string;
  /** Title in the visitor's language */
  displayName: string;
  category: ProductCategory;
  /** In the visitor's language (display-only) */
  description: string | null;
  /** In the visitor's language (display-only) */
  specs: string[];
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
  discountPercent?: number;
  imageUrls: string[];
  /** English colour names: swatch keys and hex lookups */
  availableColors: string[];
  /** English colour name → label in the visitor's language */
  colorLabels: Record<string, string>;
};

export type CatalogCategorySectionType = {
  category: ProductCategory;
  products: CatalogDisplayProductT[];
};

export type CatalogGroupSectionType = {
  group: ProductGroup;
  products: CatalogDisplayProductT[];
};

export type CatalogShowcaseItemType = {
  group: ProductGroup;
  imageUrl: string | null;
};

export type CatalogSortOptionType =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export type CatalogGroupFilterType = ProductGroup | "all";

export type CatalogFilterStateType = {
  group: CatalogGroupFilterType;
  query: string;
  sort: CatalogSortOptionType;
};
