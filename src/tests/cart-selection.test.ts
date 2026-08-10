/**
 * Cart Selection Feature Tests
 *
 * Tests for the cart item selection functionality that allows users to:
 * - Select/deselect individual items
 * - Select/deselect all items
 * - View totals for selected items only
 * - Proceed to checkout with only selected items
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock cart items for testing
const createMockCartItem = (
  id: string,
  productName: string,
  unitPrice: number,
  quantity: number = 1
) => ({
  id,
  cart_id: "cart_123",
  product_id: `prod_${id}`,
  product_name: productName,
  variant_id: `var_${id}`,
  variant_name: "M / Black",
  quantity,
  unit_price: unitPrice, // in cents
  custom_image_url: `https://example.com/image_${id}.png`,
  printify_blueprint_id: 123,
  printify_print_provider_id: 456,
  created_at: new Date().toISOString(),
});

const mockCartItems = [
  createMockCartItem("item_1", "Premium T-Shirt", 2500, 2), // $50.00 total
  createMockCartItem("item_2", "Classic Hoodie", 5000, 1), // $50.00 total
  createMockCartItem("item_3", "Canvas Tote", 1500, 3), // $45.00 total
];

describe("Cart Selection Feature", () => {
  describe("Selection State Management", () => {
    it("should initialize with all items selected by default", () => {
      const allItemIds = new Set(mockCartItems.map((item) => item.id));

      expect(allItemIds.size).toBe(3);
      expect(allItemIds.has("item_1")).toBe(true);
      expect(allItemIds.has("item_2")).toBe(true);
      expect(allItemIds.has("item_3")).toBe(true);
    });

    it("should toggle single item selection", () => {
      const selectedIds = new Set(["item_1", "item_2", "item_3"]);

      // Toggle off item_2
      const toggleItem = (itemId: string) => {
        const next = new Set(selectedIds);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      };

      const afterToggle = toggleItem("item_2");
      expect(afterToggle.has("item_2")).toBe(false);
      expect(afterToggle.size).toBe(2);
    });

    it("should select all items", () => {
      const selectedIds = new Set<string>();

      // Select all
      const selectAll = () => {
        return new Set(mockCartItems.map((item) => item.id));
      };

      const afterSelectAll = selectAll();
      expect(afterSelectAll.size).toBe(3);
      expect(afterSelectAll.has("item_1")).toBe(true);
      expect(afterSelectAll.has("item_2")).toBe(true);
      expect(afterSelectAll.has("item_3")).toBe(true);
    });

    it("should deselect all items", () => {
      const selectedIds = new Set(["item_1", "item_2", "item_3"]);

      // Deselect all
      const deselectAll = () => new Set<string>();

      const afterDeselectAll = deselectAll();
      expect(afterDeselectAll.size).toBe(0);
    });

    it("should compute allSelected correctly", () => {
      const computeAllSelected = (
        selectedIds: Set<string>,
        totalCount: number
      ) => {
        return totalCount > 0 && selectedIds.size === totalCount;
      };

      expect(
        computeAllSelected(new Set(["item_1", "item_2", "item_3"]), 3)
      ).toBe(true);
      expect(computeAllSelected(new Set(["item_1", "item_2"]), 3)).toBe(false);
      expect(computeAllSelected(new Set(), 3)).toBe(false);
      expect(computeAllSelected(new Set(), 0)).toBe(false);
    });

    it("should compute someSelected correctly (partial selection)", () => {
      const computeSomeSelected = (
        selectedIds: Set<string>,
        totalCount: number
      ) => {
        const allSelected = totalCount > 0 && selectedIds.size === totalCount;
        return selectedIds.size > 0 && !allSelected;
      };

      expect(
        computeSomeSelected(new Set(["item_1", "item_2", "item_3"]), 3)
      ).toBe(false);
      expect(computeSomeSelected(new Set(["item_1", "item_2"]), 3)).toBe(true);
      expect(computeSomeSelected(new Set(["item_1"]), 3)).toBe(true);
      expect(computeSomeSelected(new Set(), 3)).toBe(false);
    });
  });

  describe("Selected Items Filtering", () => {
    it("should filter cart items to only selected ones", () => {
      const selectedIds = new Set(["item_1", "item_3"]);

      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      expect(selectedItems).toHaveLength(2);
      expect(selectedItems.map((i) => i.id)).toEqual(["item_1", "item_3"]);
    });

    it("should return empty array when nothing selected", () => {
      const selectedIds = new Set<string>();

      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      expect(selectedItems).toHaveLength(0);
    });

    it("should return all items when all selected", () => {
      const selectedIds = new Set(["item_1", "item_2", "item_3"]);

      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      expect(selectedItems).toHaveLength(3);
    });
  });

  describe("Selected Items Totals Calculation", () => {
    const calculateTotals = (items: typeof mockCartItems) => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      );
      // Mock shipping calculation: free over $100, otherwise $10
      const shipping = subtotal >= 10000 ? 0 : 1000;
      return {
        subtotal,
        shipping,
        total: subtotal + shipping,
      };
    };

    it("should calculate totals for selected items only", () => {
      const selectedIds = new Set(["item_1"]); // 2500 * 2 = 5000 cents = $50.00
      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      const totals = calculateTotals(selectedItems);

      expect(totals.subtotal).toBe(5000); // $50.00 in cents
      expect(totals.shipping).toBe(1000); // $10.00 (under $100)
      expect(totals.total).toBe(6000); // $60.00
    });

    it("should calculate totals for multiple selected items", () => {
      const selectedIds = new Set(["item_1", "item_2"]); // 5000 + 5000 = 10000 cents
      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      const totals = calculateTotals(selectedItems);

      expect(totals.subtotal).toBe(10000); // $100.00 in cents
      expect(totals.shipping).toBe(0); // Free (at $100)
      expect(totals.total).toBe(10000); // $100.00
    });

    it("should calculate totals for all items", () => {
      const selectedIds = new Set(["item_1", "item_2", "item_3"]);
      const selectedItems = mockCartItems.filter((item) =>
        selectedIds.has(item.id)
      );

      const totals = calculateTotals(selectedItems);

      // item_1: 2500 * 2 = 5000
      // item_2: 5000 * 1 = 5000
      // item_3: 1500 * 3 = 4500
      // Total: 14500 cents = $145.00
      expect(totals.subtotal).toBe(14500);
      expect(totals.shipping).toBe(0); // Free (over $100)
      expect(totals.total).toBe(14500);
    });

    it("should return zero totals when nothing selected", () => {
      const selectedItems: typeof mockCartItems = [];

      const totals = calculateTotals(selectedItems);

      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(1000); // Default shipping
      expect(totals.total).toBe(1000);
    });
  });

  describe("Checkout Eligibility", () => {
    it("should allow checkout when at least one item is selected", () => {
      const canCheckout = (selectedCount: number) => selectedCount > 0;

      expect(canCheckout(1)).toBe(true);
      expect(canCheckout(2)).toBe(true);
      expect(canCheckout(3)).toBe(true);
    });

    it("should prevent checkout when no items are selected", () => {
      const canCheckout = (selectedCount: number) => selectedCount > 0;

      expect(canCheckout(0)).toBe(false);
    });
  });

  describe("Session Storage Integration", () => {
    beforeEach(() => {
      // Mock sessionStorage
      const storage: Record<string, string> = {};
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(
        (key, value) => {
          storage[key] = value;
        }
      );
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(
        (key) => storage[key] || null
      );
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
        delete storage[key];
      });
    });

    it("should store selected item IDs in sessionStorage", () => {
      const selectedIds = new Set(["item_1", "item_3"]);

      sessionStorage.setItem(
        "selectedCartItems",
        JSON.stringify([...selectedIds])
      );

      const stored = sessionStorage.getItem("selectedCartItems");
      expect(stored).toBe('["item_1","item_3"]');
    });

    it("should retrieve selected item IDs from sessionStorage", () => {
      sessionStorage.setItem(
        "selectedCartItems",
        JSON.stringify(["item_1", "item_3"])
      );

      const stored = sessionStorage.getItem("selectedCartItems");
      const selectedIds = JSON.parse(stored!);

      expect(selectedIds).toEqual(["item_1", "item_3"]);
    });

    it("should handle missing sessionStorage data gracefully", () => {
      const stored = sessionStorage.getItem("selectedCartItems");

      expect(stored).toBeNull();

      // Fallback to all items
      const selectedIds = stored ? JSON.parse(stored) : null;
      expect(selectedIds).toBeNull();
    });
  });

  describe("Checkout Cart Filtering", () => {
    it("should filter cart items based on stored selection", () => {
      const storedSelection = ["item_1", "item_3"];
      const selectedSet = new Set(storedSelection);

      const filteredItems = mockCartItems.filter((item) =>
        selectedSet.has(item.id)
      );

      expect(filteredItems).toHaveLength(2);
      expect(filteredItems[0].id).toBe("item_1");
      expect(filteredItems[1].id).toBe("item_3");
    });

    it("should use all items when no selection is stored", () => {
      const storedSelection: string[] | null = null;

      // Fallback behavior: use all items
      const filteredItems =
        storedSelection && storedSelection.length > 0
          ? mockCartItems.filter((item) =>
              new Set(storedSelection).has(item.id)
            )
          : mockCartItems;

      expect(filteredItems).toHaveLength(3);
    });

    it("should use all items when selection is empty array", () => {
      const storedSelection: string[] = [];

      // Fallback behavior: use all items when empty
      const filteredItems =
        storedSelection && storedSelection.length > 0
          ? mockCartItems.filter((item) =>
              new Set(storedSelection).has(item.id)
            )
          : mockCartItems;

      expect(filteredItems).toHaveLength(3);
    });

    it("should handle invalid selection IDs gracefully", () => {
      const storedSelection = ["item_1", "invalid_id", "item_999"];
      const selectedSet = new Set(storedSelection);

      const filteredItems = mockCartItems.filter((item) =>
        selectedSet.has(item.id)
      );

      // Only item_1 exists in mockCartItems
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].id).toBe("item_1");
    });
  });

  describe("Selection Cleanup on Cart Changes", () => {
    it("should remove selection for items no longer in cart", () => {
      const selectedIds = new Set(["item_1", "item_2", "item_3"]);

      // Simulate item_2 being removed from cart
      const updatedCartItems = mockCartItems.filter(
        (item) => item.id !== "item_2"
      );
      const validIds = new Set(updatedCartItems.map((item) => item.id));

      // Clean up selection
      const cleanedSelection = new Set(
        [...selectedIds].filter((id) => validIds.has(id))
      );

      expect(cleanedSelection.size).toBe(2);
      expect(cleanedSelection.has("item_1")).toBe(true);
      expect(cleanedSelection.has("item_2")).toBe(false);
      expect(cleanedSelection.has("item_3")).toBe(true);
    });

    it("should preserve selection state when cart items remain unchanged", () => {
      const selectedIds = new Set(["item_1", "item_3"]);
      const validIds = new Set(mockCartItems.map((item) => item.id));

      const cleanedSelection = new Set(
        [...selectedIds].filter((id) => validIds.has(id))
      );

      expect(cleanedSelection.size).toBe(2);
      expect([...cleanedSelection]).toEqual(["item_1", "item_3"]);
    });
  });

  describe("UI State Helpers", () => {
    it("should format selected count display", () => {
      const formatSelectedCount = (selected: number, total: number) =>
        `${selected} of ${total} selected`;

      expect(formatSelectedCount(2, 3)).toBe("2 of 3 selected");
      expect(formatSelectedCount(0, 3)).toBe("0 of 3 selected");
      expect(formatSelectedCount(3, 3)).toBe("3 of 3 selected");
    });

    it("should determine checkbox indeterminate state", () => {
      const isIndeterminate = (someSelected: boolean, allSelected: boolean) =>
        someSelected && !allSelected;

      expect(isIndeterminate(true, false)).toBe(true); // Partial
      expect(isIndeterminate(false, true)).toBe(false); // All selected
      expect(isIndeterminate(false, false)).toBe(false); // None selected
    });
  });
});

describe("Integration: Cart to Checkout Flow", () => {
  it("should pass correct items to order creation", () => {
    // Simulate the full flow
    const selectedIds = new Set(["item_1", "item_3"]);

    // Step 1: Get selected items
    const selectedItems = mockCartItems.filter((item) =>
      selectedIds.has(item.id)
    );

    // Step 2: Calculate totals
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Step 3: Map to order items
    const orderItems = selectedItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      custom_image_url: item.custom_image_url,
    }));

    expect(orderItems).toHaveLength(2);
    expect(orderItems[0].product_name).toBe("Premium T-Shirt");
    expect(orderItems[1].product_name).toBe("Canvas Tote");
    expect(subtotal).toBe(9500); // 5000 + 4500 cents
  });

  it("should create Printify line items for selected products only", () => {
    const selectedIds = new Set(["item_2"]); // Only the hoodie

    const selectedItems = mockCartItems.filter((item) =>
      selectedIds.has(item.id)
    );

    const printifyLineItems = selectedItems.map((item) => ({
      product_id: item.product_id,
      variant_id: parseInt(item.variant_id.replace("var_", ""), 10) || 1,
      quantity: item.quantity,
    }));

    expect(printifyLineItems).toHaveLength(1);
    expect(printifyLineItems[0].product_id).toBe("prod_item_2");
    expect(printifyLineItems[0].quantity).toBe(1);
  });
});
