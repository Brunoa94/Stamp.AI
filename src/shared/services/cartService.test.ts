import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartService } from "./cartService";
import type { LocalCartItemT } from "./localCartStorageService";
import type { CartItem, CartT, CartWithItems } from "@/shared/types/cart";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

/**
 * Partial-cart checkout regression tests.
 *
 * After a successful payment only the items that were actually ordered may be
 * removed from the cart; the rest of the cart must survive the checkout.
 */

type MockSupabaseT = Record<
  "from" | "select" | "delete" | "eq" | "in" | "single",
  ReturnType<typeof vi.fn>
>;

describe("CartService partial checkout", () => {
  let mockSupabase: MockSupabaseT;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof createClient>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("removeCartItems", () => {
    it("deletes exactly the given cart item ids and nothing else", async () => {
      mockSupabase.in.mockResolvedValueOnce({ error: null });

      await CartService.removeCartItems(["item_1", "item_3"]);

      expect(mockSupabase.from).toHaveBeenCalledWith("cart_items");
      expect(mockSupabase.delete).toHaveBeenCalledTimes(1);
      expect(mockSupabase.in).toHaveBeenCalledWith("id", ["item_1", "item_3"]);
      // Must never fall back to a whole-cart delete
      expect(mockSupabase.eq).not.toHaveBeenCalledWith(
        "cart_id",
        expect.anything(),
      );
    });

    it("does not touch the database when there is nothing to remove", async () => {
      await CartService.removeCartItems([]);

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockSupabase.delete).not.toHaveBeenCalled();
    });

    it("throws when the delete fails", async () => {
      mockSupabase.in.mockResolvedValueOnce({
        error: { code: "42501", message: "permission denied" },
      });

      await expect(
        CartService.removeCartItems(["item_1"]),
      ).rejects.toThrow();
    });
  });

  describe("getCheckoutCart", () => {
    it("returns the cart with only the selected items", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "cart_123",
          user_id: "user_123",
          cart_items: [
            { id: "item_1", is_selected: true, unit_price: 2500, quantity: 1 },
            { id: "item_2", is_selected: false, unit_price: 5000, quantity: 1 },
            { id: "item_3", is_selected: true, unit_price: 1500, quantity: 2 },
          ],
        },
        error: null,
      });

      const cart = await CartService.getCheckoutCart("cart_123");

      expect(cart.id).toBe("cart_123");
      expect(cart.cart_items.map((item) => item.id)).toEqual([
        "item_1",
        "item_3",
      ]);
    });
  });
});

/**
 * Guest checkout: the local cart is copied into the anonymous user's
 * database cart when a payment starts. An in-memory store stands in for
 * the four cart primitives the copy is built from.
 */
describe("CartService.saveCartFromLocalItems", () => {
  type StoredItemT = { id: string; cart_id: string; product_id: string; variant_id: string; quantity: number; is_selected: boolean };
  let carts: { id: string; user_id: string }[];
  let items: StoredItemT[];

  function localItem(id: string, overrides: Partial<LocalCartItemT> = {}): LocalCartItemT {
    return {
      id,
      productId: `prod-${id}`,
      variantId: "101",
      productName: "Tee",
      unitPrice: 2500,
      quantity: 1,
      customImageUrl: null,
      blueprintId: 6,
      printProviderId: 99,
      isSelected: true,
      createdAt: 1,
      ...overrides,
    };
  }

  beforeEach(() => {
    carts = [];
    items = [];
    let nextId = 0;
    vi.spyOn(CartService, "getOrCreateCart").mockImplementation(async (userId) => {
      const existing = carts.find((cart) => cart.user_id === userId);
      if (existing) return existing as unknown as CartT;
      const cart = { id: `cart-${++nextId}`, user_id: userId! };
      carts.push(cart);
      return cart as unknown as CartT;
    });
    vi.spyOn(CartService, "clearCart").mockImplementation(async (cartId) => {
      items = items.filter((item) => item.cart_id !== cartId);
    });
    vi.spyOn(CartService, "addToCart").mockImplementation(async (cartId, input) => {
      const row = {
        id: `row-${++nextId}`,
        cart_id: cartId,
        product_id: input.product_id!,
        variant_id: input.variant_id!,
        quantity: input.quantity,
        is_selected: true,
      };
      items.push(row);
      return row as unknown as CartItem;
    });
    vi.spyOn(CartService, "updateCartItemsSelection").mockImplementation(async (cartId, ids) => {
      for (const item of items) {
        if (item.cart_id === cartId) item.is_selected = ids.includes(item.id);
      }
    });
    vi.spyOn(CartService, "getCart").mockImplementation(async (cartId) => ({
      ...carts.find((cart) => cart.id === cartId)!,
      cart_items: items.filter((item) => item.cart_id === cartId),
    }) as unknown as CartWithItems);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a cart holding the local items for a user with none", async () => {
    const cart = await CartService.saveCartFromLocalItems("anon-1", [
      localItem("a", { quantity: 2 }),
      localItem("b", { isSelected: false }),
    ]);

    expect(carts).toEqual([{ id: cart.id, user_id: "anon-1" }]);
    expect(cart.cart_items.map(({ product_id, quantity, is_selected }) => ({ product_id, quantity, is_selected })))
      .toEqual([
        { product_id: "prod-a", quantity: 2, is_selected: true },
        { product_id: "prod-b", quantity: 1, is_selected: false },
      ]);
  });

  it("replaces the items of the user's existing cart without creating a second one", async () => {
    const first = await CartService.saveCartFromLocalItems("anon-1", [localItem("a"), localItem("b")]);

    const second = await CartService.saveCartFromLocalItems("anon-1", [localItem("b"), localItem("c")]);

    expect(second.id).toBe(first.id);
    expect(carts).toHaveLength(1);
    expect(second.cart_items.map((item) => item.product_id)).toEqual(["prod-b", "prod-c"]);
  });
});
