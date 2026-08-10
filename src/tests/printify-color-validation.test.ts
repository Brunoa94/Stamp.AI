/**
 * Printify Color Validation Tests
 *
 * Tests to ensure colors sent to Printify are always:
 * - Black or White for apparel products (t-shirts, hoodies)
 * - White only for mugs (ceramic products)
 * - No color requirement for canvas/poster products
 *
 * This ensures consistent product quality and prevents color mismatches
 * that could result in failed orders or customer complaints.
 *
 * Color validation happens at TWO levels:
 * 1. Client-side: filterDisplayColors() filters which colors are shown to users
 * 2. Server-side: validateColorForBlueprint() enforces allowed colors before Printify API call
 */

import { describe, it, expect, vi } from "vitest";

// Import the actual filterDisplayColors function (client-side UI filtering)
import { filterDisplayColors } from "@/features/homepage/lib/constants/colorSwatches";

// Import the actual color validation functions (server-side enforcement)
import {
  validateColorForBlueprint,
  getCategoryForBlueprint,
  getAllowedColorsForCategory,
} from "@/lib/colorValidation";

// Product category constraints for reference
const PRODUCT_CATEGORIES = ["apparel", "mug", "tote", "canvas", "socks", "poster"] as const;
type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Validates that a color is allowed for a specific product category
 * Uses the actual validation function from colorValidation.ts
 */
function validateColorForProduct(
  color: string | null | undefined,
  category: ProductCategory
): { valid: boolean; error?: string } {
  // Map category to a blueprint ID for validation
  const categoryBlueprintMap: Record<ProductCategory, number> = {
    apparel: 145, // T-Shirt
    mug: 1320, // Ceramic Mug
    tote: 553, // Tote Bag
    canvas: 658, // Canvas
    socks: 462, // Socks
    poster: 658, // Use canvas as poster equivalent
  };

  const blueprintId = categoryBlueprintMap[category];
  const result = validateColorForBlueprint(color, blueprintId);

  return {
    valid: result.valid,
    error: result.error,
  };
}

describe("Color Validation for Printify Products", () => {
  describe("filterDisplayColors function", () => {
    it("should return only Black and White when both are available", () => {
      const colors = ["Red", "Blue", "Black", "White", "Green"];
      const result = filterDisplayColors(colors);

      expect(result).toHaveLength(2);
      expect(result).toContain("Black");
      expect(result).toContain("White");
      expect(result).not.toContain("Red");
      expect(result).not.toContain("Blue");
      expect(result).not.toContain("Green");
    });

    it("should return all colors when Black is not available", () => {
      const colors = ["Red", "Blue", "White", "Green"];
      const result = filterDisplayColors(colors);

      expect(result).toEqual(colors);
    });

    it("should return all colors when White is not available", () => {
      const colors = ["Red", "Blue", "Black", "Green"];
      const result = filterDisplayColors(colors);

      expect(result).toEqual(colors);
    });

    it("should handle empty array", () => {
      const result = filterDisplayColors([]);
      expect(result).toEqual([]);
    });

    it("should preserve original casing", () => {
      const colors = ["WHITE", "black"];
      const result = filterDisplayColors(colors);

      expect(result).toContain("WHITE");
      expect(result).toContain("black");
    });

    it("should handle case variations of Black and White", () => {
      const colors = ["BLACK", "white", "Red"];
      const result = filterDisplayColors(colors);

      expect(result).toHaveLength(2);
      expect(result).toContain("BLACK");
      expect(result).toContain("white");
    });
  });

  describe("Apparel Products (T-Shirts, Hoodies)", () => {
    const apparelBlueprints = [145, 5, 6, 77, 1525, 49];

    it.each(apparelBlueprints)(
      "should allow Black color for blueprint %i",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("apparel");

        const result = validateColorForProduct("Black", "apparel");
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    );

    it.each(apparelBlueprints)(
      "should allow White color for blueprint %i",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("apparel");

        const result = validateColorForProduct("White", "apparel");
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    );

    it.each(apparelBlueprints)(
      "should reject Red color for blueprint %i",
      (blueprintId) => {
        const result = validateColorForProduct("Red", "apparel");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Red");
        expect(result.error).toContain("not allowed");
      }
    );

    it.each(apparelBlueprints)(
      "should reject Navy color for blueprint %i",
      (blueprintId) => {
        const result = validateColorForProduct("Navy", "apparel");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Navy");
      }
    );

    it("should default to Black when no color provided for apparel", () => {
      // Server-side validation defaults to first allowed color (Black) when none provided
      const result = validateColorForBlueprint(null, 145); // T-Shirt blueprint
      expect(result.valid).toBe(true);
      expect(result.normalizedColor).toBe("Black");
    });

    it("should handle case-insensitive color matching", () => {
      expect(validateColorForProduct("black", "apparel").valid).toBe(true);
      expect(validateColorForProduct("BLACK", "apparel").valid).toBe(true);
      expect(validateColorForProduct("Black", "apparel").valid).toBe(true);
      expect(validateColorForProduct("white", "apparel").valid).toBe(true);
      expect(validateColorForProduct("WHITE", "apparel").valid).toBe(true);
    });
  });

  describe("Mug Products (Ceramic, Glossy)", () => {
    const mugBlueprints = [1320, 468];

    it.each(mugBlueprints)(
      "should allow White color for mug blueprint %i",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("mug");

        const result = validateColorForProduct("White", "mug");
        expect(result.valid).toBe(true);
      }
    );

    it.each(mugBlueprints)(
      "should reject Black color for mug blueprint %i (mugs are white)",
      (blueprintId) => {
        const result = validateColorForProduct("Black", "mug");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Black");
        expect(result.error).toContain("not allowed");
      }
    );

    it("should not require color for mugs (default white)", () => {
      const result = validateColorForProduct(null, "mug");
      expect(result.valid).toBe(true);
    });

    it("should reject colored mugs", () => {
      expect(validateColorForProduct("Blue", "mug").valid).toBe(false);
      expect(validateColorForProduct("Red", "mug").valid).toBe(false);
      expect(validateColorForProduct("Green", "mug").valid).toBe(false);
    });
  });

  describe("Tote Bag Products", () => {
    const toteBlueprints = [553, 1389];

    it.each(toteBlueprints)(
      "should allow Black for tote blueprint %i",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("tote");

        const result = validateColorForProduct("Black", "tote");
        expect(result.valid).toBe(true);
      }
    );

    it.each(toteBlueprints)(
      "should allow White for tote blueprint %i",
      (blueprintId) => {
        const result = validateColorForProduct("White", "tote");
        expect(result.valid).toBe(true);
      }
    );

    it.each(toteBlueprints)(
      "should allow Natural for tote blueprint %i",
      (blueprintId) => {
        const result = validateColorForProduct("Natural", "tote");
        expect(result.valid).toBe(true);
      }
    );

    it("should reject colors not in allowed list", () => {
      expect(validateColorForProduct("Red", "tote").valid).toBe(false);
      expect(validateColorForProduct("Blue", "tote").valid).toBe(false);
    });

    it("should default to Black when no color provided for tote bags", () => {
      // Server-side validation defaults to first allowed color (Black) when none provided
      const result = validateColorForBlueprint(null, 553); // Tote blueprint
      expect(result.valid).toBe(true);
      expect(result.normalizedColor).toBe("Black");
    });
  });

  describe("Canvas Products", () => {
    const canvasBlueprints = [658];

    it.each(canvasBlueprints)(
      "should not require color for canvas blueprint %i",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("canvas");

        const result = validateColorForProduct(null, "canvas");
        expect(result.valid).toBe(true);
      }
    );

    it("should accept any color for canvas (no restrictions)", () => {
      expect(validateColorForProduct("White", "canvas").valid).toBe(true);
      expect(validateColorForProduct("Black", "canvas").valid).toBe(true);
      expect(validateColorForProduct("Custom", "canvas").valid).toBe(true);
    });
  });

  describe("Socks Products", () => {
    const socksBlueprints = [462, 496];

    it.each(socksBlueprints)(
      "should allow White for socks blueprint %i (base color for AOP)",
      (blueprintId) => {
        const category = getCategoryForBlueprint(blueprintId);
        expect(category).toBe("socks");

        const result = validateColorForProduct("White", "socks");
        expect(result.valid).toBe(true);
      }
    );

    it("should not require color for socks (default white base)", () => {
      const result = validateColorForProduct(null, "socks");
      expect(result.valid).toBe(true);
    });

    it("should reject non-white colors for socks", () => {
      expect(validateColorForProduct("Black", "socks").valid).toBe(false);
      expect(validateColorForProduct("Red", "socks").valid).toBe(false);
    });
  });

  describe("Poster Products", () => {
    it("should not require color for posters", () => {
      const result = validateColorForProduct(null, "poster");
      expect(result.valid).toBe(true);
    });

    it("should accept any color for posters (no restrictions)", () => {
      expect(validateColorForProduct("White", "poster").valid).toBe(true);
      expect(validateColorForProduct("Matte", "poster").valid).toBe(true);
      expect(validateColorForProduct(null, "poster").valid).toBe(true);
    });
  });
});

describe("Blueprint Category Mapping", () => {
  it("should correctly map T-Shirt blueprints to apparel", () => {
    expect(getCategoryForBlueprint(145)).toBe("apparel");
    expect(getCategoryForBlueprint(5)).toBe("apparel");
    expect(getCategoryForBlueprint(6)).toBe("apparel");
  });

  it("should correctly map Hoodie blueprints to apparel", () => {
    expect(getCategoryForBlueprint(77)).toBe("apparel");
    expect(getCategoryForBlueprint(1525)).toBe("apparel");
    expect(getCategoryForBlueprint(49)).toBe("apparel");
  });

  it("should correctly map Mug blueprints", () => {
    expect(getCategoryForBlueprint(1320)).toBe("mug");
    expect(getCategoryForBlueprint(468)).toBe("mug");
  });

  it("should correctly map Tote blueprints", () => {
    expect(getCategoryForBlueprint(553)).toBe("tote");
    expect(getCategoryForBlueprint(1389)).toBe("tote");
  });

  it("should correctly map Canvas blueprints", () => {
    expect(getCategoryForBlueprint(658)).toBe("canvas");
  });

  it("should correctly map Socks blueprints", () => {
    expect(getCategoryForBlueprint(462)).toBe("socks");
    expect(getCategoryForBlueprint(496)).toBe("socks");
  });

  it("should return null for unknown blueprints", () => {
    expect(getCategoryForBlueprint(99999)).toBeNull();
    expect(getCategoryForBlueprint(0)).toBeNull();
  });
});

describe("Integration: Color Selection in Cart Items", () => {
  interface MockCartItem {
    product_id: string;
    blueprint_id: number;
    variant_name: string; // "M / Black" or "White" etc.
    color: string | null;
  }

  /**
   * Extracts color from variant name (e.g., "M / Black" -> "Black")
   */
  function extractColorFromVariant(variantName: string): string | null {
    const parts = variantName.split("/").map((p) => p.trim());
    // Color is typically the last part or a standalone value
    const colorPart = parts.find((p) =>
      ["black", "white", "red", "blue", "natural", "navy"].includes(
        p.toLowerCase()
      )
    );
    return colorPart || null;
  }

  it("should extract color from variant name with size", () => {
    expect(extractColorFromVariant("M / Black")).toBe("Black");
    expect(extractColorFromVariant("XL / White")).toBe("White");
    expect(extractColorFromVariant("S / Navy")).toBe("Navy");
  });

  it("should extract color from standalone variant name", () => {
    expect(extractColorFromVariant("White")).toBe("White");
    expect(extractColorFromVariant("Black")).toBe("Black");
  });

  it("should return null for variant names without color", () => {
    expect(extractColorFromVariant("Medium")).toBeNull();
    expect(extractColorFromVariant("11oz")).toBeNull();
  });

  it("should validate cart item colors for apparel products", () => {
    const tshirtCartItem: MockCartItem = {
      product_id: "prod_123",
      blueprint_id: 145, // T-Shirt
      variant_name: "L / Black",
      color: "Black",
    };

    const category = getCategoryForBlueprint(tshirtCartItem.blueprint_id);
    const validation = validateColorForProduct(tshirtCartItem.color, category!);

    expect(validation.valid).toBe(true);
  });

  it("should reject invalid cart item colors for apparel products", () => {
    const invalidTshirtCartItem: MockCartItem = {
      product_id: "prod_456",
      blueprint_id: 6, // T-Shirt
      variant_name: "M / Red",
      color: "Red",
    };

    const category = getCategoryForBlueprint(invalidTshirtCartItem.blueprint_id);
    const validation = validateColorForProduct(
      invalidTshirtCartItem.color,
      category!
    );

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("Red");
  });

  it("should validate mug cart items (white only)", () => {
    const mugCartItem: MockCartItem = {
      product_id: "prod_789",
      blueprint_id: 1320, // Ceramic Mug
      variant_name: "11oz",
      color: "White",
    };

    const category = getCategoryForBlueprint(mugCartItem.blueprint_id);
    const validation = validateColorForProduct(mugCartItem.color, category!);

    expect(validation.valid).toBe(true);
  });

  it("should validate multiple cart items with different products", () => {
    const cartItems: MockCartItem[] = [
      {
        product_id: "prod_1",
        blueprint_id: 145, // T-Shirt
        variant_name: "M / Black",
        color: "Black",
      },
      {
        product_id: "prod_2",
        blueprint_id: 77, // Hoodie
        variant_name: "L / White",
        color: "White",
      },
      {
        product_id: "prod_3",
        blueprint_id: 1320, // Mug
        variant_name: "11oz",
        color: "White",
      },
      {
        product_id: "prod_4",
        blueprint_id: 553, // Tote
        variant_name: "Natural",
        color: "Natural",
      },
    ];

    const validationResults = cartItems.map((item) => {
      const category = getCategoryForBlueprint(item.blueprint_id);
      return {
        product_id: item.product_id,
        category,
        ...validateColorForProduct(item.color, category!),
      };
    });

    // All items should be valid
    validationResults.forEach((result) => {
      expect(result.valid).toBe(true);
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  it("should handle undefined color", () => {
    const result = validateColorForProduct(undefined, "canvas");
    expect(result.valid).toBe(true);
  });

  it("should default to Black for empty string color on apparel", () => {
    // Empty string is treated as no color, defaults to Black
    const result = validateColorForBlueprint("", 145);
    expect(result.valid).toBe(true);
    expect(result.normalizedColor).toBe("Black");
  });

  it("should default to Black for whitespace-only color on apparel", () => {
    // Whitespace-only is treated as no color, defaults to Black
    const result = validateColorForBlueprint("   ", 145);
    expect(result.valid).toBe(true);
    expect(result.normalizedColor).toBe("Black");
  });

  it("should handle color with extra spaces (trimmed)", () => {
    // Color normalization trims input, so " Black " becomes "black" and matches
    const result = validateColorForBlueprint(" Black ", 145);
    expect(result.valid).toBe(true);
    expect(result.normalizedColor).toBe("Black");
  });

  it("should provide helpful error messages", () => {
    const result = validateColorForProduct("Purple", "apparel");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Purple");
    expect(result.error).toContain("Allowed colors:");
    expect(result.error).toContain("Black");
    expect(result.error).toContain("White");
  });
});

describe("Server-Side Color Enforcement", () => {
  describe("Apparel Products - MUST be Black or White", () => {
    const apparelBlueprints = [
      { id: 145, name: "Unisex Softstyle T-Shirt" },
      { id: 5, name: "Unisex Cotton Crew Tee" },
      { id: 6, name: "Unisex Heavy Cotton Tee" },
      { id: 77, name: "Unisex Heavy Blend Hoodie" },
      { id: 1525, name: "Unisex Hoodie (Gildan 18500)" },
      { id: 49, name: "Unisex Crewneck Sweatshirt" },
    ];

    it.each(apparelBlueprints)(
      "should REJECT Red color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Red", id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Red");
        expect(result.error).toContain("not allowed");
      }
    );

    it.each(apparelBlueprints)(
      "should REJECT Blue color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Blue", id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Blue");
      }
    );

    it.each(apparelBlueprints)(
      "should REJECT Navy color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Navy", id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Navy");
      }
    );

    it.each(apparelBlueprints)(
      "should REJECT Heather Grey color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Heather Grey", id);
        expect(result.valid).toBe(false);
      }
    );

    it.each(apparelBlueprints)(
      "should ACCEPT Black color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Black", id);
        expect(result.valid).toBe(true);
        expect(result.normalizedColor).toBe("Black");
      }
    );

    it.each(apparelBlueprints)(
      "should ACCEPT White color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("White", id);
        expect(result.valid).toBe(true);
        expect(result.normalizedColor).toBe("White");
      }
    );
  });

  describe("Mug Products - MUST be White only", () => {
    const mugBlueprints = [
      { id: 1320, name: "Ceramic Mug 11oz" },
      { id: 468, name: "White Glossy Mug" },
    ];

    it.each(mugBlueprints)(
      "should REJECT Black color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("Black", id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Black");
      }
    );

    it.each(mugBlueprints)(
      "should ACCEPT White color for $name (blueprint $id)",
      ({ id }) => {
        const result = validateColorForBlueprint("White", id);
        expect(result.valid).toBe(true);
        expect(result.normalizedColor).toBe("White");
      }
    );
  });

  describe("Integration: Prevent Invalid Colors in Cart Flow", () => {
    it("should block Red t-shirt from being created on Printify", () => {
      // Simulate what happens when a Red t-shirt is attempted
      const blueprintId = 145; // T-Shirt
      const selectedColor = "Red";

      const validation = validateColorForBlueprint(selectedColor, blueprintId);

      // This should fail BEFORE sending to Printify
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.category).toBe("apparel");
    });

    it("should block Blue hoodie from being created on Printify", () => {
      const blueprintId = 77; // Hoodie
      const selectedColor = "Blue";

      const validation = validateColorForBlueprint(selectedColor, blueprintId);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("Blue");
    });

    it("should allow Black t-shirt to proceed to Printify", () => {
      const blueprintId = 145; // T-Shirt
      const selectedColor = "Black";

      const validation = validateColorForBlueprint(selectedColor, blueprintId);

      expect(validation.valid).toBe(true);
      expect(validation.normalizedColor).toBe("Black");
    });

    it("should normalize color case before validation", () => {
      // Test various case inputs that should all normalize to "Black"
      const testCases = ["black", "BLACK", "Black", "bLaCk"];

      testCases.forEach((color) => {
        const result = validateColorForBlueprint(color, 145);
        expect(result.valid).toBe(true);
        expect(result.normalizedColor).toBe("Black");
      });
    });
  });
});
