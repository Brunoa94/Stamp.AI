/**
 * Color Validation for Printify Products
 *
 * Enforces that only approved colors (Black/White) are used for apparel products.
 * This prevents unwanted color variations from being created on Printify.
 */

// Allowed colors per product category
const ALLOWED_COLORS: Record<string, string[]> = {
  // Apparel (T-shirts, Hoodies, Sweatshirts) - only Black and White
  apparel: ["black", "white"],
  // Mugs - typically white only
  mug: ["white"],
  // Tote bags - Black, White, or Natural
  tote: ["black", "white", "natural"],
  // Canvas/Poster - no color restrictions (print on white canvas)
  canvas: [],
  // Socks - white base for all-over print
  socks: ["white"],
};

// Blueprint IDs mapped to categories
const BLUEPRINT_CATEGORIES: Record<number, string> = {
  // T-Shirts
  145: "apparel", // Unisex Softstyle T-Shirt (Gildan 64000)
  5: "apparel", // Unisex Cotton Crew Tee (Next Level)
  6: "apparel", // Unisex Heavy Cotton Tee (Gildan 5000)

  // Hoodies & Sweatshirts
  77: "apparel", // Unisex Heavy Blend Hoodie (Gildan)
  1525: "apparel", // Unisex Heavy Blend Hoodie (Gildan 18500)
  49: "apparel", // Unisex Heavy Blend Crewneck Sweatshirt

  // Tote Bags
  553: "tote", // Cotton Tote Bag
  1389: "tote", // AOP Tote Bag

  // Mugs
  1320: "mug", // Ceramic Mug 11oz
  468: "mug", // White Glossy Mug

  // Canvas
  658: "canvas", // Matte Canvas

  // Socks
  462: "socks", // Cushioned Crew Socks
  496: "socks", // Crew Socks
};

export interface ColorValidationResult {
  valid: boolean;
  normalizedColor: string | null;
  error?: string;
  category: string | null;
}

/**
 * Get the product category for a blueprint ID
 */
export function getCategoryForBlueprint(blueprintId: number): string | null {
  return BLUEPRINT_CATEGORIES[blueprintId] || null;
}

/**
 * Validates and normalizes a color for a specific blueprint
 *
 * @param color - The color to validate (e.g., "Black", "WHITE", "red")
 * @param blueprintId - The Printify blueprint ID
 * @returns Validation result with normalized color or error
 */
export function validateColorForBlueprint(
  color: string | null | undefined,
  blueprintId: number
): ColorValidationResult {
  const category = getCategoryForBlueprint(blueprintId);

  // Unknown blueprint - allow any color but log warning
  if (!category) {
    console.warn(
      `⚠️ Unknown blueprint ${blueprintId} - allowing color "${color}" without validation`
    );
    return {
      valid: true,
      normalizedColor: color || null,
      category: null,
    };
  }

  const allowedColors = ALLOWED_COLORS[category] || [];

  // If no color restrictions for this category, allow any color
  if (allowedColors.length === 0) {
    return {
      valid: true,
      normalizedColor: color || null,
      category,
    };
  }

  // If no color provided
  if (!color || color.trim() === "") {
    // For categories that require color (apparel, tote), default to first allowed
    if (category === "apparel" || category === "tote") {
      const defaultColor = allowedColors[0];
      console.log(
        `📋 No color provided for ${category}, defaulting to "${defaultColor}"`
      );
      return {
        valid: true,
        normalizedColor: defaultColor,
        category,
      };
    }
    // For other categories (mug, socks), allow no color
    return {
      valid: true,
      normalizedColor: null,
      category,
    };
  }

  // Normalize color for comparison
  const normalizedInput = color.toLowerCase().trim();

  // Check if color is allowed
  const matchedColor = allowedColors.find((allowed) => allowed === normalizedInput);

  if (matchedColor) {
    // Return properly capitalized color
    const properColor = matchedColor.charAt(0).toUpperCase() + matchedColor.slice(1);
    return {
      valid: true,
      normalizedColor: properColor,
      category,
    };
  }

  // Color not allowed - return error with helpful message
  const allowedList = allowedColors
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(", ");

  return {
    valid: false,
    normalizedColor: null,
    error: `Color "${color}" is not allowed for ${category} products. Allowed colors: ${allowedList}`,
    category,
  };
}

/**
 * Filters variant list to only include variants with allowed colors
 *
 * @param variants - Array of Printify variants
 * @param blueprintId - The blueprint ID
 * @param selectedColor - The user's selected color (optional)
 * @returns Filtered variants with only allowed colors
 */
export function filterVariantsByAllowedColors(
  variants: any[],
  blueprintId: number,
  selectedColor?: string | null
): any[] {
  const category = getCategoryForBlueprint(blueprintId);

  // Unknown category - return all variants
  if (!category) {
    return variants;
  }

  const allowedColors = ALLOWED_COLORS[category] || [];

  // No color restrictions - return all variants
  if (allowedColors.length === 0) {
    return variants;
  }

  // Filter variants to only include allowed colors
  const filtered = variants.filter((v: any) => {
    const variantColor = (
      v.options?.color ||
      v.title?.split(" / ")[0]?.trim() ||
      ""
    ).toLowerCase();

    // Check if variant color is in allowed list
    return allowedColors.some((allowed) => variantColor.includes(allowed));
  });

  // If selected color is provided, further filter to that specific color
  if (selectedColor) {
    const normalizedSelected = selectedColor.toLowerCase().trim();
    const specificFiltered = filtered.filter((v: any) => {
      const variantColor = (
        v.options?.color ||
        v.title?.split(" / ")[0]?.trim() ||
        ""
      ).toLowerCase();
      return variantColor === normalizedSelected || variantColor.includes(normalizedSelected);
    });

    if (specificFiltered.length > 0) {
      return specificFiltered;
    }
  }

  return filtered;
}
