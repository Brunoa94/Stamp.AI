import { productSchema } from "./product";
import type { ProductData } from "./types";

/**
 * schema.org ItemList of Products — used by listing pages (e.g. /catalog)
 * so search engines see the full product collection as one list.
 */

function productListItem(product: ProductData, index: number) {
  const { "@context": _, ...item } = productSchema(product);

  return {
    "@type": "ListItem",
    position: index + 1,
    item,
  };
}

export function itemListSchema(name: string, products: ProductData[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map(productListItem),
  };
}
