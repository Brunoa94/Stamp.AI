/**
 * useCheckoutCart
 *
 * Resolves the checkout cart from the `cartId` search param via the shared
 * cart query, keeping CheckoutContent free of data-plumbing.
 *
 * Filters cart items based on the `is_selected` column in the database,
 * which is set when the user proceeds to checkout from the cart page.
 */

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCartById } from "@/queries/cartQueries";
import type { CartWithItems } from "@/types/cart";

export function useCheckoutCart() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");
  const { data: cart, isLoading, error } = useCartById(cartId || "");

  // Filter cart items to only include selected items (is_selected = true)
  const filteredCart = useMemo<CartWithItems | undefined>(() => {
    if (!cart) return undefined;

    // Filter cart items to only include those marked as selected in the database
    const selectedItems = cart.cart_items.filter(
      (item) => (item as any).is_selected !== false
    );

    // If no items are selected, fall back to all items (backwards compatibility)
    if (selectedItems.length === 0) {
      return cart;
    }

    return {
      ...cart,
      cart_items: selectedItems,
    };
  }, [cart]);

  return { cartId, cart: filteredCart, isLoading, error };
}
