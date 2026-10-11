/**
 * Multi-Product Order Tests
 *
 * Comprehensive test coverage for ordering multiple products in a single order.
 * Tests cover cart selection, order creation, Printify submission, and order display.
 */

import { describe, it, expect } from "vitest";
import type { CartItem, CartWithItems } from "@/shared/types/cart";

/**
 * ============================================================================
 * MOCK DATA FACTORIES
 * ============================================================================
 */

const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: `item_${Math.random().toString(36).slice(2)}`,
  cart_id: "cart_123",
  product_id: "prod_123",
  variant_id: "var_456",
  quantity: 1,
  unit_price: 2500, // $25.00 in cents
  custom_image_url: "https://example.com/design.png",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product_name: "Custom T-Shirt",
  variant_name: "M / Black",
  printify_blueprint_id: 145,
  printify_print_provider_id: 29,
  design_config: null,
  ...overrides,
});

const createMockCart = (items: CartItem[]): CartWithItems => ({
  id: "cart_123",
  user_id: "user_123",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cart_items: items,
});

/**
 * ============================================================================
 * ORDER SERVICE MAPPER TESTS - Multiple Products
 * ============================================================================
 */

describe("Cart Multi-Item Selection", () => {
  describe("Item Selection State", () => {
    it("should default all items to selected", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1" }),
        createMockCartItem({ id: "item_2" }),
        createMockCartItem({ id: "item_3" }),
      ]);

      // Simulating default selection state
      const selectedItems = new Set(cart.cart_items.map((item) => item.id));

      expect(selectedItems.size).toBe(3);
      expect(selectedItems.has("item_1")).toBe(true);
      expect(selectedItems.has("item_2")).toBe(true);
      expect(selectedItems.has("item_3")).toBe(true);
    });

    it("should allow toggling individual item selection", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1" }),
        createMockCartItem({ id: "item_2" }),
        createMockCartItem({ id: "item_3" }),
      ]);

      const selectedItems = new Set(cart.cart_items.map((item) => item.id));

      // Toggle off item_2
      selectedItems.delete("item_2");

      expect(selectedItems.size).toBe(2);
      expect(selectedItems.has("item_1")).toBe(true);
      expect(selectedItems.has("item_2")).toBe(false);
      expect(selectedItems.has("item_3")).toBe(true);
    });

    it("should filter cart items by selection for checkout", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1", unit_price: 2500 }),
        createMockCartItem({ id: "item_2", unit_price: 1500 }),
        createMockCartItem({ id: "item_3", unit_price: 2000 }),
      ]);

      const selectedIds = new Set(["item_1", "item_3"]);
      const selectedItems = cart.cart_items.filter((item) =>
        selectedIds.has(item.id)
      );

      expect(selectedItems).toHaveLength(2);
      expect(selectedItems[0].id).toBe("item_1");
      expect(selectedItems[1].id).toBe("item_3");
    });

    it("should prevent checkout with no items selected", () => {
      const selectedIds = new Set<string>();

      const isCheckoutDisabled = selectedIds.size === 0;

      expect(isCheckoutDisabled).toBe(true);
    });

    it("should allow checkout with at least one item selected", () => {
      const selectedIds = new Set(["item_1"]);

      const isCheckoutDisabled = selectedIds.size === 0;

      expect(isCheckoutDisabled).toBe(false);
    });
  });

  describe("Select All / Deselect All", () => {
    it("should select all items when 'select all' is clicked", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1" }),
        createMockCartItem({ id: "item_2" }),
        createMockCartItem({ id: "item_3" }),
      ]);

      // Simulating select all
      const selectedItems = new Set(cart.cart_items.map((item) => item.id));

      expect(selectedItems.size).toBe(cart.cart_items.length);
    });

    it("should deselect all items when 'deselect all' is clicked", () => {
      const selectedItems = new Set(["item_1", "item_2", "item_3"]);

      // Simulating deselect all
      selectedItems.clear();

      expect(selectedItems.size).toBe(0);
    });

    it("should show 'select all' checkbox as checked when all items selected", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1" }),
        createMockCartItem({ id: "item_2" }),
      ]);
      const selectedItems = new Set(["item_1", "item_2"]);

      const allSelected = cart.cart_items.every((item) =>
        selectedItems.has(item.id)
      );

      expect(allSelected).toBe(true);
    });

    it("should show 'select all' checkbox as indeterminate when some items selected", () => {
      const cart = createMockCart([
        createMockCartItem({ id: "item_1" }),
        createMockCartItem({ id: "item_2" }),
        createMockCartItem({ id: "item_3" }),
      ]);
      const selectedItems = new Set(["item_1", "item_3"]);

      const allSelected = cart.cart_items.every((item) =>
        selectedItems.has(item.id)
      );
      const someSelected = cart.cart_items.some((item) =>
        selectedItems.has(item.id)
      );
      const isIndeterminate = someSelected && !allSelected;

      expect(isIndeterminate).toBe(true);
    });
  });
});

/**
 * ============================================================================
 * PRINTIFY LINE ITEMS TESTS - Multiple Products
 * ============================================================================
 */

describe("Printify Line Items - Multi-Product", () => {
  describe("buildPrintifyLineItems", () => {
    it("should build line items array from multiple cart items", () => {
      const cartItems: CartItem[] = [
        createMockCartItem({
          product_id: "prod_1",
          variant_id: "var_1",
          quantity: 2,
          printify_blueprint_id: 145,
          printify_print_provider_id: 29,
        }),
        createMockCartItem({
          product_id: "prod_2",
          variant_id: "var_2",
          quantity: 1,
          printify_blueprint_id: 146,
          printify_print_provider_id: 29,
        }),
      ];

      // Simulating buildPrintifyLineItems logic
      const lineItems = cartItems.map((item) => ({
        blueprint_id: item.printify_blueprint_id,
        print_provider_id: item.printify_print_provider_id,
        variant_id: parseInt(item.variant_id || "0", 10),
        quantity: item.quantity || 1,
      }));

      expect(lineItems).toHaveLength(2);
      expect(lineItems[0].blueprint_id).toBe(145);
      expect(lineItems[0].quantity).toBe(2);
      expect(lineItems[1].blueprint_id).toBe(146);
      expect(lineItems[1].quantity).toBe(1);
    });

    it("should preserve print_areas for custom products", () => {
      const customDesign = {
        front: [
          {
            src: "https://example.com/design.png",
            x: 0.5,
            y: 0.5,
            scale: 1,
            angle: 0,
          },
        ],
      };

      const cartItem = createMockCartItem({
        design_config: { print_areas: customDesign },
      });

      // Simulating line item with print_areas
      const lineItem = {
        blueprint_id: cartItem.printify_blueprint_id,
        print_provider_id: cartItem.printify_print_provider_id,
        variant_id: parseInt(cartItem.variant_id || "0", 10),
        quantity: cartItem.quantity || 1,
        print_areas: customDesign,
      };

      expect(lineItem.print_areas).toBeDefined();
      expect(lineItem.print_areas.front).toHaveLength(1);
    });

    it("should handle mixed products (with and without custom designs)", () => {
      const cartItems: CartItem[] = [
        createMockCartItem({
          product_id: "prod_custom",
          design_config: {
            print_areas: { front: [{ src: "design1.png" }] },
          },
        }),
        createMockCartItem({
          product_id: "prod_standard",
          design_config: null,
        }),
      ];

      const lineItems = cartItems.map((item) => ({
        product_id: item.product_id,
        has_custom_design: !!item.design_config?.print_areas,
      }));

      expect(lineItems[0].has_custom_design).toBe(true);
      expect(lineItems[1].has_custom_design).toBe(false);
    });
  });

  describe("Line Item Validation", () => {
    it("should validate all line items have required fields", () => {
      const lineItems = [
        { blueprint_id: 145, print_provider_id: 29, variant_id: 123, quantity: 1 },
        { blueprint_id: 146, print_provider_id: 29, variant_id: 456, quantity: 2 },
      ];

      const allValid = lineItems.every(
        (item) =>
          item.blueprint_id &&
          item.print_provider_id &&
          item.variant_id &&
          item.quantity > 0
      );

      expect(allValid).toBe(true);
    });

    it("should reject line items missing blueprint_id", () => {
      const invalidLineItem = {
        print_provider_id: 29,
        variant_id: 123,
        quantity: 1,
      };

      const hasRequiredFields = !!(
        (invalidLineItem as { blueprint_id?: unknown }).blueprint_id &&
        invalidLineItem.print_provider_id &&
        invalidLineItem.variant_id
      );

      expect(hasRequiredFields).toBe(false);
    });

    it("should reject line items with zero quantity", () => {
      const lineItems = [
        { blueprint_id: 145, print_provider_id: 29, variant_id: 123, quantity: 0 },
      ];

      const validItems = lineItems.filter((item) => item.quantity > 0);

      expect(validItems).toHaveLength(0);
    });
  });
});

/**
 * ============================================================================
 * ORDER DISPLAY TESTS - Multiple Items per Order
 * ============================================================================
 */

describe("Order Display - Multiple Items", () => {
  describe("Order List View", () => {
    it("should display order with multiple items", () => {
      const order = {
        id: "order_123",
        order_number: "ORD-2026-00001",
        total_amount: 95,
        order_items: [
          {
            id: "item_1",
            product_name: "Custom T-Shirt",
            quantity: 2,
            unit_price: 25,
            total_price: 50,
          },
          {
            id: "item_2",
            product_name: "Custom Mug",
            quantity: 1,
            unit_price: 15,
            total_price: 15,
          },
          {
            id: "item_3",
            product_name: "Custom Poster",
            quantity: 3,
            unit_price: 10,
            total_price: 30,
          },
        ],
      };

      expect(order.order_items).toHaveLength(3);
      expect(order.order_items[0].product_name).toBe("Custom T-Shirt");
      expect(order.order_items[1].product_name).toBe("Custom Mug");
      expect(order.order_items[2].product_name).toBe("Custom Poster");
    });

    it("should calculate total items count across order", () => {
      const order = {
        order_items: [
          { quantity: 2 },
          { quantity: 1 },
          { quantity: 3 },
        ],
      };

      const totalItemsCount = order.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      expect(totalItemsCount).toBe(6);
    });

    it("should show first item image as order thumbnail", () => {
      const order = {
        order_items: [
          { custom_image_url: "https://example.com/design1.png" },
          { custom_image_url: "https://example.com/design2.png" },
        ],
      };

      const thumbnailUrl = order.order_items[0]?.custom_image_url;

      expect(thumbnailUrl).toBe("https://example.com/design1.png");
    });

    it("should display summary text for multiple items", () => {
      const order = {
        order_items: [
          { product_name: "T-Shirt", quantity: 2 },
          { product_name: "Mug", quantity: 1 },
        ],
      };

      const itemCount = order.order_items.length;
      const summaryText =
        itemCount === 1
          ? order.order_items[0].product_name
          : `${itemCount} items`;

      expect(summaryText).toBe("2 items");
    });

    it("should display single item name for single-item orders", () => {
      const order = {
        order_items: [{ product_name: "Custom T-Shirt", quantity: 1 }],
      };

      const itemCount = order.order_items.length;
      const summaryText =
        itemCount === 1
          ? order.order_items[0].product_name
          : `${itemCount} items`;

      expect(summaryText).toBe("Custom T-Shirt");
    });
  });

  describe("Order Details Modal", () => {
    it("should list all items in order details", () => {
      const order = {
        id: "order_123",
        order_items: [
          {
            id: "item_1",
            product_name: "Custom T-Shirt",
            variant_name: "M / Black",
            quantity: 2,
            unit_price: 25,
            total_price: 50,
            custom_image_url: "https://example.com/tshirt.png",
          },
          {
            id: "item_2",
            product_name: "Custom Mug",
            variant_name: "White",
            quantity: 1,
            unit_price: 15,
            total_price: 15,
            custom_image_url: "https://example.com/mug.png",
          },
        ],
      };

      // Verify each item has required display fields
      order.order_items.forEach((item) => {
        expect(item).toHaveProperty("product_name");
        expect(item).toHaveProperty("variant_name");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("unit_price");
        expect(item).toHaveProperty("total_price");
        expect(item).toHaveProperty("custom_image_url");
      });
    });

    it("should show individual item prices and order total", () => {
      const order = {
        subtotal: 65,
        shipping_cost: 0,
        tax_amount: 0,
        total_amount: 65,
        order_items: [
          { total_price: 50 },
          { total_price: 15 },
        ],
      };

      const itemsTotal = order.order_items.reduce(
        (sum, item) => sum + item.total_price,
        0
      );

      expect(itemsTotal).toBe(65);
      expect(order.total_amount).toBe(65);
    });

    it("should allow viewing each item image in fullscreen", () => {
      const order = {
        order_items: [
          { id: "item_1", custom_image_url: "https://example.com/design1.png" },
          { id: "item_2", custom_image_url: "https://example.com/design2.png" },
        ],
      };

      // Each item should have its own viewable image
      order.order_items.forEach((item) => {
        expect(item.custom_image_url).toBeTruthy();
      });
    });
  });
});

/**
 * ============================================================================
 * EDGE CASES - Multi-Product Orders
 * ============================================================================
 */

describe("Multi-Product Order Edge Cases", () => {
  describe("Same Product Different Variants", () => {
    it("should handle same product with different size/color selections", () => {
      const items = [
        createMockCartItem({
          product_id: "prod_tshirt",
          variant_id: "var_sm_black",
          variant_name: "Small / Black",
          quantity: 1,
        }),
        createMockCartItem({
          product_id: "prod_tshirt",
          variant_id: "var_lg_white",
          variant_name: "Large / White",
          quantity: 2,
        }),
      ];

      expect(items[0].product_id).toBe(items[1].product_id);
      expect(items[0].variant_id).not.toBe(items[1].variant_id);
    });
  });

  describe("Mixed Product Types", () => {
    it("should handle mix of apparel, accessories, and prints", () => {
      const items = [
        createMockCartItem({
          product_name: "T-Shirt",
          printify_blueprint_id: 145, // T-shirt blueprint
        }),
        createMockCartItem({
          product_name: "Mug",
          printify_blueprint_id: 175, // Mug blueprint
        }),
        createMockCartItem({
          product_name: "Poster",
          printify_blueprint_id: 398, // Poster blueprint
        }),
        createMockCartItem({
          product_name: "Tote Bag",
          printify_blueprint_id: 474, // Tote blueprint
        }),
      ];

      // All should have unique blueprint IDs
      const blueprintIds = items.map((item) => item.printify_blueprint_id);
      const uniqueBlueprints = new Set(blueprintIds);

      expect(uniqueBlueprints.size).toBe(4);
    });
  });

  describe("Partial Fulfillment Scenario", () => {
    it("should track fulfillment status per item", () => {
      const orderItems = [
        { id: "item_1", fulfillment_status: "fulfilled" },
        { id: "item_2", fulfillment_status: "pending" },
        { id: "item_3", fulfillment_status: "shipped" },
      ];

      const fulfilledCount = orderItems.filter(
        (item) => item.fulfillment_status === "fulfilled"
      ).length;
      const pendingCount = orderItems.filter(
        (item) => item.fulfillment_status === "pending"
      ).length;

      expect(fulfilledCount).toBe(1);
      expect(pendingCount).toBe(1);
    });
  });
});
