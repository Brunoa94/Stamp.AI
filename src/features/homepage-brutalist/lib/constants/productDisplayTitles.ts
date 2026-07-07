/**
 * Product Display Title Mapping
 *
 * Maps blueprint IDs to customer-facing display titles
 */

export const PRODUCT_DISPLAY_TITLES: Record<number, string> = {
  // Featured Products
  26: "Men's T-shirt Stretch",
  6: "T-shirt Premium Cotton",
  145: "T-shirt Regular",
  1389: "Tote Bag",

  // Other Products (for future use)
  5: "Unisex Cotton Crew Tee",
  9: "Women's Favorite Tee",
  10: "Women's Flowy Racerback Tank",
  11: "Women's Jersey Short Sleeve Deep V-Neck Tee",
  14: "The Boyfriend Tee for Women",
  15: "Men's Very Important Tee",
  18: "Women's Ideal Racerback Tank",
  31: "Infant Long Sleeve Bodysuit",
  157: "Kids Heavy Cotton™ Tee",
}

/**
 * Get display title for a blueprint ID
 * Falls back to original name if not mapped
 */
export function getDisplayTitle(blueprintId: number, fallbackName: string): string {
  return PRODUCT_DISPLAY_TITLES[blueprintId] || fallbackName
}
