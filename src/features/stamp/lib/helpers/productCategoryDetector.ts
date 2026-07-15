/**
 * Product Category Detector
 *
 * Detects product category from catalog_products display_title.
 * Used for grouping products in the UI and determining appropriate sizes.
 */

export type ProductCategory =
  | "tshirt"
  | "hoodie"
  | "sweatshirt"
  | "tank"
  | "longsleeve"
  | "totebag"
  | "mug"
  | "poster"
  | "canvas"
  | "phone-case"
  | "hat"
  | "other";

export type ProductGroup = "clothing" | "accessories";

/**
 * Keywords to detect product category from title
 * Order matters - more specific terms should come first
 */
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  tshirt: [
    "unisex t-shirt",
    "t-shirt",
    "tshirt",
    "tee shirt",
    "classic tee",
    "premium tee",
    "cotton tee",
    "crew neck",
  ],
  hoodie: [
    "pullover hoodie",
    "hoodie",
    "hooded sweatshirt",
    "zip hoodie",
    "full zip",
  ],
  sweatshirt: [
    "crewneck sweatshirt",
    "sweatshirt",
    "crew sweatshirt",
    "fleece",
  ],
  longsleeve: [
    "long sleeve",
    "longsleeve",
    "long-sleeve",
  ],
  tank: [
    "tank top",
    "tanktop",
    "racerback",
    "muscle tank",
  ],
  totebag: [
    "tote bag",
    "totebag",
    "canvas tote",
    "shopping bag",
    "beach bag",
  ],
  mug: [
    "coffee mug",
    "ceramic mug",
    "mug",
    "travel mug",
    "tumbler",
  ],
  poster: [
    "poster",
    "art print",
    "wall art",
    "print",
    "framed",
  ],
  canvas: [
    "canvas print",
    "canvas",
    "gallery wrap",
  ],
  "phone-case": [
    "phone case",
    "iphone case",
    "samsung case",
    "case",
  ],
  hat: [
    "baseball cap",
    "dad hat",
    "trucker hat",
    "snapback",
    "beanie",
    "cap",
    "hat",
  ],
  other: [],
};

/**
 * Categories that are considered clothing (apparel)
 */
const CLOTHING_CATEGORIES: Set<ProductCategory> = new Set([
  "tshirt",
  "hoodie",
  "sweatshirt",
  "tank",
  "longsleeve",
]);

/**
 * Detect product category from display title
 */
export function detectProductCategory(displayTitle: string): ProductCategory {
  const titleLower = displayTitle.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return category as ProductCategory;
      }
    }
  }

  return "other";
}

/**
 * Get product group (clothing vs accessories) from category
 */
export function getProductGroup(category: ProductCategory): ProductGroup {
  return CLOTHING_CATEGORIES.has(category) ? "clothing" : "accessories";
}

/**
 * Detect product group directly from display title
 */
export function detectProductGroup(displayTitle: string): ProductGroup {
  const category = detectProductCategory(displayTitle);
  return getProductGroup(category);
}

/**
 * Check if a product is clothing based on title
 */
export function isClothingProduct(displayTitle: string): boolean {
  return detectProductGroup(displayTitle) === "clothing";
}

/**
 * Check if a product is an accessory based on title
 */
export function isAccessoryProduct(displayTitle: string): boolean {
  return detectProductGroup(displayTitle) === "accessories";
}

/**
 * Expected size type for each product category
 * Used to validate sizes returned from Printify API
 */
export type ExpectedSizeType = "apparel" | "one-size" | "mug" | "poster" | "variable";

export function getExpectedSizeType(category: ProductCategory): ExpectedSizeType {
  switch (category) {
    case "tshirt":
    case "hoodie":
    case "sweatshirt":
    case "tank":
    case "longsleeve":
      return "apparel";
    case "totebag":
    case "hat":
      return "one-size";
    case "mug":
      return "mug";
    case "poster":
    case "canvas":
      return "poster";
    default:
      return "variable";
  }
}

/**
 * Get expected size type from display title
 */
export function detectExpectedSizeType(displayTitle: string): ExpectedSizeType {
  const category = detectProductCategory(displayTitle);
  return getExpectedSizeType(category);
}
