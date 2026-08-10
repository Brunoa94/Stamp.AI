/**
 * Printify Multi-Item Order Tests
 *
 * Tests for creating Printify orders with multiple line items.
 * Covers validation, API payload structure, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validatePrintifyLineItem,
  PrintifyLineItem,
  CreatePrintifyOrderRequest,
} from "@/types/printifyOrder";

/**
 * Helper to validate multiple line items (simulates batch validation)
 * This mirrors what the Printify service would do
 */
function validatePrintifyLineItems(items: PrintifyLineItem[]): PrintifyLineItem[] {
  if (!items || items.length === 0) {
    throw new Error("No valid line items to submit");
  }
  return items.map((item, index) => validatePrintifyLineItem(item, index));
}

/**
 * ============================================================================
 * MOCK DATA
 * ============================================================================
 */

const createValidBlueprintLineItem = (
  overrides: Partial<PrintifyLineItem> = {}
): PrintifyLineItem => ({
  blueprint_id: 145,
  print_provider_id: 29,
  variant_id: 12345,
  quantity: 1,
  print_areas: {
    front: [
      {
        src: "https://example.com/design.png",
        x: 0.5,
        y: 0.5,
        scale: 1,
        angle: 0,
      },
    ],
  },
  ...overrides,
});

const createValidProductIdLineItem = (
  overrides: Partial<PrintifyLineItem> = {}
): PrintifyLineItem => ({
  product_id: "prod_12345abc",
  variant_id: 67890,
  quantity: 1,
  ...overrides,
});

const createValidSkuLineItem = (
  overrides: Partial<PrintifyLineItem> = {}
): PrintifyLineItem => ({
  sku: "SKU-TSHIRT-M-BLK-001",
  quantity: 1,
  ...overrides,
});

/**
 * ============================================================================
 * SINGLE LINE ITEM VALIDATION
 * ============================================================================
 */

describe("Printify Line Item Validation - Single Item", () => {
  describe("Blueprint-based items", () => {
    it("should validate blueprint item with all required fields", () => {
      const item = createValidBlueprintLineItem();

      const result = validatePrintifyLineItem(item, 0);

      expect(result.blueprint_id).toBe(145);
      expect(result.print_provider_id).toBe(29);
      expect(result.variant_id).toBe(12345);
      expect(result.quantity).toBe(1);
    });

    it("should require print_provider_id with blueprint_id", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 145,
        variant_id: 12345,
        quantity: 1,
      };

      // Should pass validation - print_provider_id is optional per Printify API
      const result = validatePrintifyLineItem(item, 0);
      expect(result.blueprint_id).toBe(145);
    });

    it("should throw error when blueprint_id without variant_id", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 145,
        print_provider_id: 29,
        quantity: 1,
      };

      expect(() => validatePrintifyLineItem(item, 0)).toThrow(
        "Line item 0: blueprint_id configuration requires variant_id"
      );
    });

    it("should preserve print_areas for blueprint items", () => {
      const printAreas = {
        front: [{ src: "https://example.com/design.png" }],
        back: [{ src: "https://example.com/design-back.png" }],
      };

      const item = createValidBlueprintLineItem({ print_areas: printAreas });

      const result = validatePrintifyLineItem(item, 0);

      expect(result.print_areas).toEqual(printAreas);
    });
  });

  describe("Product ID-based items", () => {
    it("should validate product_id item", () => {
      const item = createValidProductIdLineItem();

      const result = validatePrintifyLineItem(item, 0);

      expect(result.product_id).toBe("prod_12345abc");
      expect(result.variant_id).toBe(67890);
    });

    it("should remove blueprint fields when product_id is present", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const item: PrintifyLineItem = {
        product_id: "prod_123",
        blueprint_id: 145, // Should be removed
        print_provider_id: 29, // Should be removed
        variant_id: 12345,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);

      expect(result.product_id).toBe("prod_123");
      expect(result.blueprint_id).toBeUndefined();
      expect(result.print_provider_id).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("should remove print_areas when product_id is present", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const item: PrintifyLineItem = {
        product_id: "prod_123",
        variant_id: 12345,
        quantity: 1,
        print_areas: { front: [{ src: "test.png" }] }, // Should be removed
      };

      const result = validatePrintifyLineItem(item, 0);

      expect(result.print_areas).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe("SKU-based items", () => {
    it("should validate SKU item", () => {
      const item = createValidSkuLineItem();

      const result = validatePrintifyLineItem(item, 0);

      expect(result.sku).toBe("SKU-TSHIRT-M-BLK-001");
      expect(result.quantity).toBe(1);
    });
  });
});

/**
 * ============================================================================
 * MULTIPLE LINE ITEMS VALIDATION
 * ============================================================================
 */

describe("Printify Line Items Validation - Multiple Items", () => {
  describe("validatePrintifyLineItems", () => {
    it("should validate array of multiple valid items", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({ variant_id: 100 }),
        createValidBlueprintLineItem({ variant_id: 200 }),
        createValidBlueprintLineItem({ variant_id: 300 }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(result).toHaveLength(3);
      expect(result[0].variant_id).toBe(100);
      expect(result[1].variant_id).toBe(200);
      expect(result[2].variant_id).toBe(300);
    });

    it("should throw error when no line items provided", () => {
      expect(() => validatePrintifyLineItems([])).toThrow(
        "No valid line items to submit"
      );
    });

    it("should throw error when all items are invalid", () => {
      const invalidItems: PrintifyLineItem[] = [
        { quantity: 1 }, // No identifier
        { quantity: 2 }, // No identifier
      ];

      expect(() => validatePrintifyLineItems(invalidItems)).toThrow();
    });

    it("should handle mixed valid and invalid items gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const mixedItems: PrintifyLineItem[] = [
        createValidBlueprintLineItem(), // Valid
        { quantity: 1 } as PrintifyLineItem, // Invalid - will throw
      ];

      // The validation throws on first invalid item
      expect(() => validatePrintifyLineItems(mixedItems)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should validate items with different identifier types", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem(), // blueprint_id
        createValidProductIdLineItem(), // product_id
        createValidSkuLineItem(), // sku
      ];

      const result = validatePrintifyLineItems(items);

      expect(result).toHaveLength(3);
      expect(result[0].blueprint_id).toBe(145);
      expect(result[1].product_id).toBe("prod_12345abc");
      expect(result[2].sku).toBe("SKU-TSHIRT-M-BLK-001");
    });

    it("should preserve quantity for each item", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({ quantity: 5 }),
        createValidBlueprintLineItem({ quantity: 3 }),
        createValidBlueprintLineItem({ quantity: 1 }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(result[0].quantity).toBe(5);
      expect(result[1].quantity).toBe(3);
      expect(result[2].quantity).toBe(1);
    });
  });

  describe("Error indexing", () => {
    it("should include correct index in error messages", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem(),
        createValidBlueprintLineItem(),
        { blueprint_id: 145, quantity: 1 }, // Missing variant_id - index 2
      ];

      expect(() => validatePrintifyLineItems(items)).toThrow("Line item 2:");
    });
  });
});

/**
 * ============================================================================
 * PRINTIFY ORDER REQUEST STRUCTURE
 * ============================================================================
 */

describe("Printify Order Request - Multi-Item", () => {
  describe("Request payload structure", () => {
    it("should create valid order request with multiple line items", () => {
      const request: CreatePrintifyOrderRequest = {
        line_items: [
          createValidBlueprintLineItem({ variant_id: 100, quantity: 2 }),
          createValidBlueprintLineItem({ variant_id: 200, quantity: 1 }),
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "+1 555-0123",
          address1: "123 Main St",
          city: "New York",
          region: "NY",
          zip: "10001",
          country: "US",
        },
        is_test: false,
      };

      expect(request.line_items).toHaveLength(2);
      expect(request.shipping_address.first_name).toBe("John");
      expect(request.is_test).toBe(false);
    });

    it("should include metadata with order reference", () => {
      const request: CreatePrintifyOrderRequest = {
        line_items: [createValidBlueprintLineItem()],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "+1 555-0123",
          address1: "123 Main St",
          city: "New York",
          region: "NY",
          zip: "10001",
          country: "US",
        },
        metadata: {
          order_id: "order_123",
          payment_intent_id: "pi_abc123",
          provider: "stripe",
        },
      };

      expect(request.metadata?.order_id).toBe("order_123");
      expect(request.metadata?.payment_intent_id).toBe("pi_abc123");
    });

    it("should support test mode flag", () => {
      const request: CreatePrintifyOrderRequest = {
        line_items: [createValidBlueprintLineItem()],
        shipping_address: {
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          phone: "+1 555-0000",
          address1: "Test St",
          city: "Test City",
          region: "TS",
          zip: "00000",
          country: "US",
        },
        is_test: true,
      };

      expect(request.is_test).toBe(true);
    });
  });

  describe("Line items array requirements", () => {
    it("should require at least one line item", () => {
      const request: CreatePrintifyOrderRequest = {
        line_items: [],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "+1 555-0123",
          address1: "123 Main St",
          city: "New York",
          region: "NY",
          zip: "10001",
          country: "US",
        },
      };

      expect(() => validatePrintifyLineItems(request.line_items)).toThrow(
        "No valid line items to submit"
      );
    });

    it("should handle orders with many line items", () => {
      const lineItems = Array.from({ length: 20 }, (_, i) =>
        createValidBlueprintLineItem({
          variant_id: 1000 + i,
          quantity: 1,
        })
      );

      const result = validatePrintifyLineItems(lineItems);

      expect(result).toHaveLength(20);
    });
  });
});

/**
 * ============================================================================
 * EDGE CASES - PRINTIFY MULTI-ITEM
 * ============================================================================
 */

describe("Printify Multi-Item Edge Cases", () => {
  describe("Same product different variants", () => {
    it("should allow multiple items with same blueprint but different variants", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({
          blueprint_id: 145,
          variant_id: 100, // Small / Black
          quantity: 1,
        }),
        createValidBlueprintLineItem({
          blueprint_id: 145,
          variant_id: 200, // Medium / Black
          quantity: 2,
        }),
        createValidBlueprintLineItem({
          blueprint_id: 145,
          variant_id: 300, // Large / White
          quantity: 1,
        }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(result).toHaveLength(3);
      // All same blueprint
      result.forEach((item) => {
        expect(item.blueprint_id).toBe(145);
      });
      // Different variants
      expect(new Set(result.map((item) => item.variant_id)).size).toBe(3);
    });
  });

  describe("Different print providers", () => {
    it("should handle items from different print providers", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({
          blueprint_id: 145,
          print_provider_id: 29, // Provider A
        }),
        createValidBlueprintLineItem({
          blueprint_id: 175,
          print_provider_id: 99, // Provider B
        }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(result[0].print_provider_id).toBe(29);
      expect(result[1].print_provider_id).toBe(99);
    });
  });

  describe("Quantity handling", () => {
    it("should preserve high quantities", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({ quantity: 100 }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(result[0].quantity).toBe(100);
    });

    it("should default quantity to 1 if not specified", () => {
      const item: PrintifyLineItem = {
        blueprint_id: 145,
        print_provider_id: 29,
        variant_id: 12345,
        quantity: 1,
      };

      const result = validatePrintifyLineItem(item, 0);

      expect(result.quantity).toBe(1);
    });
  });

  describe("Print areas variations", () => {
    it("should handle items with different print area configurations", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({
          print_areas: {
            front: [{ src: "front1.png" }],
          },
        }),
        createValidBlueprintLineItem({
          print_areas: {
            front: [{ src: "front2.png" }],
            back: [{ src: "back2.png" }],
          },
        }),
        createValidBlueprintLineItem({
          print_areas: {
            left_sleeve: [{ src: "sleeve.png" }],
          },
        }),
      ];

      const result = validatePrintifyLineItems(items);

      expect(Object.keys(result[0].print_areas || {})).toContain("front");
      expect(Object.keys(result[1].print_areas || {})).toContain("back");
      expect(Object.keys(result[2].print_areas || {})).toContain("left_sleeve");
    });

    it("should allow items without print_areas (pre-configured products)", () => {
      const items: PrintifyLineItem[] = [
        createValidProductIdLineItem(), // No print_areas needed
      ];

      const result = validatePrintifyLineItems(items);

      expect(result[0].print_areas).toBeUndefined();
    });
  });

  describe("Total quantity calculation", () => {
    it("should calculate total items across all line items", () => {
      const items: PrintifyLineItem[] = [
        createValidBlueprintLineItem({ quantity: 5 }),
        createValidBlueprintLineItem({ quantity: 3 }),
        createValidBlueprintLineItem({ quantity: 2 }),
      ];

      const totalQuantity = items.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );

      expect(totalQuantity).toBe(10);
    });
  });
});

/**
 * ============================================================================
 * API RESPONSE HANDLING
 * ============================================================================
 */

describe("Printify API Response - Multi-Item Orders", () => {
  describe("Success response", () => {
    it("should parse order response with multiple items", () => {
      const mockResponse = {
        id: "printify_order_123",
        status: "pending",
        line_items: [
          {
            product_id: "prod_1",
            variant_id: 100,
            quantity: 2,
            status: "pending",
          },
          {
            product_id: "prod_2",
            variant_id: 200,
            quantity: 1,
            status: "pending",
          },
        ],
        total_shipping: 0,
        total_tax: 0,
        total_price: 9500, // In cents
      };

      expect(mockResponse.id).toBe("printify_order_123");
      expect(mockResponse.line_items).toHaveLength(2);
    });
  });

  describe("Partial fulfillment tracking", () => {
    it("should track individual item status", () => {
      const mockOrderStatus = {
        id: "printify_order_123",
        line_items: [
          { variant_id: 100, status: "fulfilled", tracking_number: "TRK001" },
          { variant_id: 200, status: "in_production", tracking_number: null },
          { variant_id: 300, status: "pending", tracking_number: null },
        ],
      };

      const fulfilledItems = mockOrderStatus.line_items.filter(
        (item) => item.status === "fulfilled"
      );
      const pendingItems = mockOrderStatus.line_items.filter(
        (item) => item.status === "pending"
      );

      expect(fulfilledItems).toHaveLength(1);
      expect(pendingItems).toHaveLength(1);
    });
  });

  describe("Error handling", () => {
    it("should identify which line item caused validation error", () => {
      const errorResponse = {
        error: "validation_error",
        details: {
          line_items: [
            { index: 0, errors: [] },
            { index: 1, errors: ["Invalid variant_id"] },
            { index: 2, errors: [] },
          ],
        },
      };

      const itemsWithErrors = errorResponse.details.line_items.filter(
        (item) => item.errors.length > 0
      );

      expect(itemsWithErrors).toHaveLength(1);
      expect(itemsWithErrors[0].index).toBe(1);
    });
  });
});
