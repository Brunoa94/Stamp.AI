/**
 * Catalog View Transitions
 *
 * View transition classes used by the catalog's <ViewTransition>
 * boundaries. The animations live in catalog.css.
 */

/** Showcase ↔ filtered results panel swap. */
export const CATALOG_PANEL_ENTER = "catalog-panel-enter";
export const CATALOG_PANEL_EXIT = "catalog-panel-exit";

/** Product card cover ↔ quick-view dialog image morph. */
export const CATALOG_PRODUCT_MORPH = "catalog-product-morph";

/** Shared element name pairing a product's card cover with its dialog image. */
export function getCatalogProductTransitionName(blueprintId: number): string {
  return `catalog-product-${blueprintId}`;
}
