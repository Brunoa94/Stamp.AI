/**
 * useCheckoutCart
 *
 * Resolves the checkout cart from the `cartId` search param via the shared
 * cart query, keeping CheckoutContent free of data-plumbing.
 *
 * Only the items marked as selected in the database (`is_selected`, set when
 * the user proceeds to checkout from the cart page) are exposed. The same
 * mapper is used by order creation and post-payment cleanup so every step of
 * the checkout sees the same set of items.
 */

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCartById } from "@/queries/cartQueries";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import type { CartWithItems } from "@/types/cart";

export function useCheckoutCart() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");
  const { data: cart, isLoading, error } = useCartById(cartId || "");

  const checkoutCart = useMemo<CartWithItems | undefined>(() => {
    if (!cart) return undefined;
    return CartServiceMapper.mapCartToCheckoutCart(cart);
  }, [cart]);

  return { cartId, cart: checkoutCart, isLoading, error };
}
