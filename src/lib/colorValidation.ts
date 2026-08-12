/**
 * Color Validation for Printify Products
 *
 * Client-side validation that mirrors the server-side validation in
 * supabase/functions/_shared/colorValidation.ts
 *
 * This allows the UI to validate colors before sending to the server,
 * providing faster feedback to users.
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
  // Poster - no color restrictions
  poster: [],
  // Notebooks - no color restrictions (cover print)
  notebook: [],
  // Pillows - no color restrictions (all-over print)
  pillow: [],
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
  441: "mug", // Ceramic Mug EU
  468: "mug", // White Glossy Mug

  // Canvas
  658: "canvas", // Matte Canvas

  // Socks
  462: "socks", // Cushioned Crew Socks
  496: "socks", // Crew Socks

  // Notebooks
  475: "notebook", // Spiral Journal EU

  // Pillows
  229: "pillow", // Spun Polyester Square Pillowcase
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
 * Get allowed colors for a category
 */
export function getAllowedColorsForCategory(category: string): string[] {
  return ALLOWED_COLORS[category] || [];
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
      `Unknown blueprint ${blueprintId} - allowing color "${color}" without validation`
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
      return {
        valid: true,
        normalizedColor: defaultColor.charAt(0).toUpperCase() + defaultColor.slice(1),
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
  const matchedColor = allowedColors.find(
    (allowed) => allowed === normalizedInput
  );

  if (matchedColor) {
    // Return properly capitalized color
    const properColor =
      matchedColor.charAt(0).toUpperCase() + matchedColor.slice(1);
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
 * Check if a color is valid for a blueprint without returning error details
 */
export function isColorValidForBlueprint(
  color: string | null | undefined,
  blueprintId: number
): boolean {
  return validateColorForBlueprint(color, blueprintId).valid;
}
