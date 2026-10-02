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
  | "socks"
  | "pillow"
  | "notebook"
  | "other";

export type ProductGroup = "clothing" | "accessories";

/**
 * Keywords to detect product category from title
 * Order matters - more specific terms should come first
 */
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  tshirt: [
    "unisex t-shirt",
    "kids t-shirt",
    "t-shirt",
    "tshirt",
    "tee shirt",
    "classic tee",
    "premium tee",
    "cotton tee",
    "heavy cotton",
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
  notebook: [
    "spiral journal",
    "spiral notebook",
    "notebook",
    "journal",
    "notepad",
  ],
  socks: [
    "crew socks",
    "sublimation socks",
    "ankle socks",
    "socks",
  ],
  pillow: [
    "throw pillow",
    "faux linen pillow",
    "pillowcase",
    "pillow",
    "cushion",
    "pillow case",
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

  // Prefer the most specific (longest) keyword across all categories, so a
  // "Pillow Case" is a pillow rather than a phone "case" and a "Canvas Tote
  // Bag" is a tote rather than a canvas print.
  let best: { category: ProductCategory; length: number } | null = null;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword) && (!best || keyword.length > best.length)) {
        best = { category: category as ProductCategory, length: keyword.length };
      }
    }
  }

  return best?.category ?? "other";
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
function detectProductGroup(displayTitle: string): ProductGroup {
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
function isAccessoryProduct(displayTitle: string): boolean {
  return detectProductGroup(displayTitle) === "accessories";
}

/**
 * Expected size type for each product category
 * Used to validate sizes returned from Printify API
 */
type ExpectedSizeType = "apparel" | "one-size" | "mug" | "poster" | "variable";

function getExpectedSizeType(category: ProductCategory): ExpectedSizeType {
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
function detectExpectedSizeType(displayTitle: string): ExpectedSizeType {
  const category = detectProductCategory(displayTitle);
  return getExpectedSizeType(category);
}

/**
 * Categories that should NOT show color selection
 * These products only come in one color (e.g., white mugs, white socks)
 */
const NO_COLOR_SELECTION_CATEGORIES: Set<ProductCategory> = new Set([
  "mug",
  "socks",
  "pillow",
  "canvas",
  "poster",
]);

/**
 * Categories sold in white only (acceptance policy CUSTOM-03): the UI offers a
 * single white swatch and the server rejects any other color.
 */
const WHITE_ONLY_CATEGORIES: Set<ProductCategory> = new Set([
  "mug",
  "canvas",
  "notebook",
  "pillow",
  "socks",
  "totebag",
]);

/** The color offered for white-only categories. */
export const WHITE_ONLY_COLOR = "White";

export function isWhiteOnlyCategory(displayTitle: string): boolean {
  if (!displayTitle || displayTitle.trim() === "") return false;
  return WHITE_ONLY_CATEGORIES.has(detectProductCategory(displayTitle));
}

/**
 * Check if a product should show color selection based on its title.
 * White-only categories still show their single white swatch so the choice is
 * explicit; categories without any color option (posters) show none.
 * Returns false if title is empty/unknown (safer default - wait for title to load)
 */
export function shouldShowColorSelection(displayTitle: string): boolean {
  // If no title provided, default to hiding colors (safer - wait for data to load)
  if (!displayTitle || displayTitle.trim() === "") {
    return false;
  }
  const category = detectProductCategory(displayTitle);
  if (WHITE_ONLY_CATEGORIES.has(category)) return true;
  return !NO_COLOR_SELECTION_CATEGORIES.has(category);
}
