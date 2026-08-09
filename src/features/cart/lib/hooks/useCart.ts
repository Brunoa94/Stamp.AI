/**
 * useCart
 *
 * Orchestration hook for the cart page. Wraps the shared cart query layer
 * and exposes the data plus the quantity/remove/checkout handlers the UI
 * needs, keeping CartContent purely presentational.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { AnalyticsService } from "@/services/analyticsService";

export function useCart() {
  const router = useRouter();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { itemCount, cart, isLoading, error } = useCartSummary();
  const { handleError } = useErrorHandler();

  if (error) handleError(error);

  const updateQuantity = (itemId: string, quantity: number) => {
    updateCartItem.mutate({ itemId, update: { quantity } });
  };

  const removeItem = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const checkout = () => {
    if (!cart) return;

    const totals = CartServiceMapper.calculateCartTotals(cart.cart_items);
    AnalyticsService.track("begin_checkout", {
      currency: "USD",
      value: totals.subtotal + totals.shipping,
      items: cart.cart_items.map((item) => ({
        item_id: item.product_id || item.id,
        item_name: item.product_name || "Custom Product",
        price: (item.selling_price ?? item.unit_price ?? 0) / 100,
        quantity: item.quantity ?? 1,
      })),
    });

    router.push(`/checkout?cartId=${cart.id}`);
  };

  const totals = cart
    ? CartServiceMapper.calculateCartTotals(cart.cart_items)
    : null;
  const total = totals ? totals.subtotal + totals.shipping : 0;

  return {
    cart,
    itemCount,
    isLoading,
    total,
    updateQuantity,
    removeItem,
    checkout,
  };
}
