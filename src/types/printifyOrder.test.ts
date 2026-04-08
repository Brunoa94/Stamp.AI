import { describe, it, expect, vi } from "vitest";
import { validatePrintifyLineItem, PrintifyLineItem } from "./printifyOrder";

describe("validatePrintifyLineItem", () => {
  describe("primary identifier validation", () => {
    it("should throw error when no primary identifier is present", () => {
      const item: PrintifyLineItem = { quantity: 1 };

      expect(() => validatePrintifyLineItem(item, 0)).toThrow(
        "Line item 0: must have either product_id, blueprint_id, or sku"
      );
    });

    it("should accept item with product_id", () => {
      const item: PrintifyLineItem = {
        product_id: "prod_123",
        variant_id: 456,
        quantity: 2,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result.product_id).toBe("prod_123");
    });

    it("should accept item with blueprint_id and variant_id", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 123,
        print_provider_id: 456,
        variant_id: 789,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result.blueprint_id).toBe(123);
    });

    it("should accept item with sku", () => {
      const item: PrintifyLineItem = {
        sku: "SKU-12345",
        quantity: 3,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result.sku).toBe("SKU-12345");
    });
  });

  describe("print_provider_id validation", () => {
    it("should throw error when print_provider_id is present without blueprint_id", () => {
      const item: PrintifyLineItem = {
        product_id: "prod_123",
        print_provider_id: 456,
        variant_id: 789,
        quantity: 1,
      };

      expect(() => validatePrintifyLineItem(item, 1)).toThrow(
        "Line item 1: print_provider_id requires blueprint_id to be present"
      );
    });

    it("should accept print_provider_id when blueprint_id is present", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 123,
        print_provider_id: 456,
        variant_id: 789,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result.print_provider_id).toBe(456);
      expect(result.blueprint_id).toBe(123);
    });
  });

  describe("product_id and blueprint fields conflict", () => {
    it("should remove blueprint fields when product_id is present with blueprint_id", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const item: PrintifyLineItem = {
        product_id: "prod_123",
        blueprint_id: 456,
        variant_id: 789,
        quantity: 2,
      };

      const result = validatePrintifyLineItem(item, 2);

      expect(result).toEqual({
        product_id: "prod_123",
        variant_id: 789,
        quantity: 2,
      });
      expect(result.blueprint_id).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Line item 2: Removing blueprint fields")
      );

      consoleSpy.mockRestore();
    });

    it("should remove print_areas when product_id is present", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const item: PrintifyLineItem = {
        product_id: "prod_123",
        print_areas: { front: [{ type: "image", url: "test.png" }] },
        variant_id: 789,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);

      expect(result.print_areas).toBeUndefined();
      expect(result.product_id).toBe("prod_123");

      consoleSpy.mockRestore();
    });
  });

  describe("blueprint_id configuration validation", () => {
    it("should throw error when blueprint_id is present without variant_id", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 123,
        quantity: 1,
      };

      expect(() => validatePrintifyLineItem(item, 3)).toThrow(
        "Line item 3: blueprint_id configuration requires variant_id"
      );
    });

    it("should accept blueprint_id with variant_id", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 123,
        variant_id: 456,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result.blueprint_id).toBe(123);
      expect(result.variant_id).toBe(456);
    });
  });

  describe("edge cases", () => {
    it("should preserve all fields for valid product_id item", () => {
      const item: PrintifyLineItem = {
        product_id: "prod_abc",
        variant_id: 100,
        quantity: 5,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result).toEqual(item);
    });

    it("should preserve all fields for valid blueprint_id item", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 200,
        print_provider_id: 300,
        variant_id: 400,
        print_areas: { front: [] },
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);
      expect(result).toEqual(item);
    });

    it("should include correct index in error messages", () => {
      const item: PrintifyLineItem = { quantity: 1 };

      expect(() => validatePrintifyLineItem(item, 5)).toThrow("Line item 5:");
      expect(() => validatePrintifyLineItem(item, 99)).toThrow("Line item 99:");
    });
  });
});
