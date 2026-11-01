import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartService } from "./cartService";
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
