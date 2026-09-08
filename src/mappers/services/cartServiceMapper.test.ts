import { describe, expect, it } from "vitest";
import { CartServiceMapper } from "./cartServiceMapper";
import type { CartItem, CartWithItems } from "@/types/cart";

/**
 * Partial-cart checkout: only the items the user selected on the cart page
 * (persisted as `cart_items.is_selected`) may reach the order, the invoice
 * and the post-payment cart cleanup.
 */

function createCartItem(
  id: string,
  isSelected: boolean | undefined,
  unitPrice = 1000,
): CartItem {
  return {
    id,
    cart_id: "cart_123",
    product_id: `prod_${id}`,
    product_name: `Product ${id}`,
    variant_id: null,
    quantity: 1,
    unit_price: unitPrice,
    custom_image_url: null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...(isSelected === undefined ? {} : { is_selected: isSelected }),
  } as CartItem;
}

function createCart(items: CartItem[]): CartWithItems {
  return {
    id: "cart_123",
    user_id: "user_123",
    session_id: null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    cart_items: items,
  } as CartWithItems;
}

describe("CartServiceMapper.filterSelectedItems", () => {
  it("keeps only items marked as selected", () => {
    const items = [
      createCartItem("a", true),
      createCartItem("b", false),
      createCartItem("c", true),
    ];

    expect(
      CartServiceMapper.filterSelectedItems(items).map((i) => i.id),
    ).toEqual(["a", "c"]);
  });

  it("treats items without an is_selected flag as selected (legacy rows)", () => {
    const items = [createCartItem("a", undefined), createCartItem("b", false)];

    expect(
      CartServiceMapper.filterSelectedItems(items).map((i) => i.id),
    ).toEqual(["a"]);
  });

  it("returns an empty array when nothing is selected", () => {
    const items = [createCartItem("a", false), createCartItem("b", false)];

    expect(CartServiceMapper.filterSelectedItems(items)).toEqual([]);
  });
});

describe("CartServiceMapper.mapCartToCheckoutCart", () => {
  it("returns a cart containing only the selected items", () => {
    const cart = createCart([
      createCartItem("a", true, 2500),
      createCartItem("b", false, 5000),
      createCartItem("c", true, 1500),
    ]);

    const checkoutCart = CartServiceMapper.mapCartToCheckoutCart(cart);

    expect(checkoutCart.id).toBe("cart_123");
    expect(checkoutCart.cart_items.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("does not mutate the original cart", () => {
    const cart = createCart([
      createCartItem("a", true),
      createCartItem("b", false),
    ]);

    CartServiceMapper.mapCartToCheckoutCart(cart);

    expect(cart.cart_items).toHaveLength(2);
  });

  it("falls back to every item when no item is selected (backwards compatibility)", () => {
    const cart = createCart([
      createCartItem("a", false),
      createCartItem("b", false),
    ]);

    expect(
      CartServiceMapper.mapCartToCheckoutCart(cart).cart_items,
    ).toHaveLength(2);
  });

  it("keeps an empty cart empty", () => {
    expect(
      CartServiceMapper.mapCartToCheckoutCart(createCart([])).cart_items,
    ).toEqual([]);
  });
});
