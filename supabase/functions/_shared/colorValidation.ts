/**
 * Color Validation for Printify Products
 *
 * Enforces that only approved colors (Black/White) are used for apparel products.
 * This prevents unwanted color variations from being created on Printify.
 */

// Known size patterns (for products like mugs that only have size, no color)
const SIZE_ONLY_PATTERNS = /^(\d+oz|\d+ml|\d+"?\s*x\s*\d+"?|one size)$/i;

/**
 * Check if a value looks like a size (not a color)
 */
function isSizePattern(value: string | null | undefined): boolean {
  if (!value) return false;
  return SIZE_ONLY_PATTERNS.test(value.trim());
}

/**
 * Parse color and size from a Printify variant
 *
 * Handles different variant title formats:
 * - "Color / Size" (e.g., "Black / M") - standard apparel format
 * - "Size" only (e.g., "11oz") - mugs and similar products
 * - Malformed API data (e.g., color: "11oz", size: "11oz") - treats as size-only
 *
 * @param variant - Printify variant object with title and options
 * @returns Object with parsed color and size
 */
export function parseVariantColorSize(variant: {
  title?: string;
  options?: { color?: string; size?: string };
}): { color: string | null; size: string | null } {
  const optionsColor = variant.options?.color;
  const optionsSize = variant.options?.size;

  // Check for malformed API data: when "color" looks like a size (e.g., "11oz")
  // This happens with some Printify products like mugs
  if (optionsColor && isSizePattern(optionsColor)) {
    // The "color" is actually a size - treat as size-only product
    return {
      color: null,
      size: optionsColor,
    };
  }

  // If we have valid explicit options, use them
  if (optionsColor || optionsSize) {
    return {
      color: optionsColor || null,
      size: optionsSize || null,
    };
  }

  // Parse from title
  const title = variant.title || "";
  const titleParts = title.split(" / ");

  if (titleParts.length >= 2) {
    const firstPart = titleParts[0]?.trim();
    const secondPart = titleParts[1]?.trim();

    // Check if first part looks like a size (malformed "Size / Size" format)
    if (isSizePattern(firstPart)) {
      return {
        color: null,
        size: firstPart,
      };
    }

    // Normal "Color / Size" format
    return {
      color: firstPart || null,
      size: secondPart || null,
    };
  }

  // Single value - check if it's a size pattern (like "11oz" for mugs)
  const singleValue = titleParts[0]?.trim();
  if (singleValue && isSizePattern(singleValue)) {
    // It's a size (e.g., "11oz", "15oz", "12x16")
    return {
      color: null,
      size: singleValue,
    };
  }

  // Otherwise treat as color
  return {
    color: singleValue || null,
    size: null,
  };
}

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
  157: "apparel", // Kids Heavy Cotton Tee

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
    const { color: variantColor } = parseVariantColorSize(v);

    // If no color in variant (e.g., mugs with size only), allow it
    if (!variantColor) {
      return true;
    }

    // Check if variant color is in allowed list
    return allowedColors.some((allowed) => variantColor.toLowerCase().includes(allowed));
  });

  // If selected color is provided, further filter to that specific color
  if (selectedColor) {
    const normalizedSelected = selectedColor.toLowerCase().trim();
    const specificFiltered = filtered.filter((v: any) => {
      const { color: variantColor } = parseVariantColorSize(v);
      if (!variantColor) return true; // Allow colorless variants
      return variantColor.toLowerCase() === normalizedSelected || variantColor.toLowerCase().includes(normalizedSelected);
    });

    if (specificFiltered.length > 0) {
      return specificFiltered;
    }
  }

  return filtered;
}
