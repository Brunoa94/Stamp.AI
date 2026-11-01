/**
 * useCheckoutCart
 *
 * Resolves the checkout cart, keeping CheckoutContent free of data-plumbing:
 * the database cart from the `cartId` search param, or a guest's local cart
 * when there is no `cartId`.
 *
 * Only the items marked as selected (`is_selected`, set when the user
 * proceeds to checkout from the cart page) are exposed. The same mapper is
 * used by order creation and post-payment cleanup so every step of the
 * checkout sees the same set of items.
 */

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCartById, useLocalCartItems } from "@/shared/queries/cartQueries";
import { useUser } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";
import { mapLocalCartToCartWithItems } from "@/shared/mappers/localCartMapper";
import { AnalyticsService } from "@/shared/services/analyticsService";
import type { CartWithItems } from "@/shared/types/cart";

export function useCheckoutCart() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");
  const { data: user, isLoading: isUserLoading } = useUser();
  const isGuestCheckout = !cartId && !isRegisteredUser(user);
  const localItems = useLocalCartItems();
  const { data: dbCart, isLoading: isDbCartLoading, error } = useCartById(cartId || "");

  const checkoutCart = useMemo<CartWithItems | undefined>(() => {
    const cart = isGuestCheckout
      ? localItems && mapLocalCartToCartWithItems(localItems)
      : dbCart;
    if (!cart) return undefined;
    return CartServiceMapper.mapCartToCheckoutCart(cart);
  }, [isGuestCheckout, localItems, dbCart]);

  const isLoading = isUserLoading ||
    (isGuestCheckout ? localItems === null : isDbCartLoading);

  // Fire once per visit, when the guest's cart has been read.
  const trackedGuestCheckout = useRef(false);
  useEffect(() => {
    if (!isGuestCheckout || !checkoutCart || trackedGuestCheckout.current) return;
    trackedGuestCheckout.current = true;
    AnalyticsService.track("guest_checkout_started", {
      items: checkoutCart.cart_items.length,
    });
  }, [isGuestCheckout, checkoutCart]);

  return {
    cartId,
    cart: checkoutCart,
    isLoading,
    error: isGuestCheckout ? null : error,
  };
}
