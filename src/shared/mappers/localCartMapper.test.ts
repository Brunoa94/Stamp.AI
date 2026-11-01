import { describe, expect, it } from "vitest";
import {
  isLocalCart,
  LOCAL_CART_ID,
  mapLocalCartItemToAddToCartInput,
  mapLocalCartToCartWithItems,
} from "./localCartMapper";
import { CartServiceMapper } from "./services/cartServiceMapper";
import type { LocalCartItemT } from "@/shared/services/localCartStorageService";
import type { CartItem, CartWithItems } from "@/shared/types/cart";

function localItem(overrides: Partial<LocalCartItemT> = {}): LocalCartItemT {
  return {
    id: "local-1",
    productId: "prod-1",
    variantId: "101",
    productName: "Tee",
    unitPrice: 2500,
    quantity: 2,
    customImageUrl: "https://cdn/tee.png",
    blueprintId: 6,
    printProviderId: 99,
    isSelected: true,
    createdAt: 1,
    ...overrides,
  };
}

/** The same products as a database cart would hold them. */
function databaseCart(items: LocalCartItemT[]): CartWithItems {
  return {
    id: "cart-1",
    user_id: "user-1",
    session_id: null,
    status: "active",
    user_email: null,
    created_at: null,
    updated_at: null,
    cart_items: items.map(
      (item): CartItem => ({
        id: `row-${item.id}`,
        cart_id: "cart-1",
        product_id: item.productId,
        product_name: item.productName,
        variant_id: item.variantId,
        variant_name: null,
        unit_price: item.unitPrice,
        selling_price: null,
        quantity: item.quantity,
        custom_image_url: item.customImageUrl,
        custom_image_hash: null,
        custom_image_public_id: null,
        printify_blueprint_id: item.blueprintId,
        printify_print_provider_id: item.printProviderId,
        is_selected: item.isSelected,
        created_at: null,
        updated_at: null,
      }),
    ),
  };
}

describe("mapLocalCartToCartWithItems", () => {
  const items = [
    localItem(),
    localItem({ id: "local-2", productId: "prod-2", unitPrice: 4000, quantity: 1, isSelected: false }),
  ];

  it("has the same totals as a database cart with the same products", () => {
    const local = mapLocalCartToCartWithItems(items);

    expect(CartServiceMapper.calculateCartTotals(local.cart_items)).toEqual(
      CartServiceMapper.calculateCartTotals(databaseCart(items).cart_items),
    );
  });

  it("has the same line items as a database cart, keyed by the local item id", () => {
    const local = mapLocalCartToCartWithItems(items);
    const expected = databaseCart(items).cart_items.map((item, index) => ({
      ...item,
      id: items[index].id,
      cart_id: LOCAL_CART_ID,
    }));

    expect(local.cart_items).toEqual(expected);
  });

  it("keeps the selection, so checkout totals cover only selected items", () => {
    const local = mapLocalCartToCartWithItems(items);

    expect(CartServiceMapper.mapCartToCheckoutCart(local).cart_items.map((i) => i.id)).toEqual([
      "local-1",
    ]);
  });

  it("is recognised as the local cart", () => {
    expect(isLocalCart(mapLocalCartToCartWithItems(items))).toBe(true);
    expect(isLocalCart(databaseCart(items))).toBe(false);
    expect(isLocalCart(undefined)).toBe(false);
  });
});

describe("mapLocalCartItemToAddToCartInput", () => {
  it("builds the payload the database cart insert needs", () => {
    expect(mapLocalCartItemToAddToCartInput(localItem())).toEqual({
      product_id: "prod-1",
      variant_id: "101",
      product_name: "Tee",
      unit_price: 2500,
      quantity: 2,
      custom_image_url: "https://cdn/tee.png",
    });
  });
});
