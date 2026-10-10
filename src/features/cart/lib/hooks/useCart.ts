/** FOR FUTURE: DECOMPOSE THIS >HOOK IN SMALLER PIECES */

/**
 * useCart
 *
 * Orchestration hook for the cart page. Wraps the shared cart query layer
 * and exposes the data plus the quantity/remove/checkout handlers the UI
 * needs, keeping CartContent purely presentational.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCartSummary,
  useRemoveCartItem,
  useUpdateCartItem,
  useUpdateCartItemsSelection,
} from "@/shared/queries/cartQueries";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { mapBeginCheckoutEvent } from "@/features/analytics/mappers/ecommerceMappers";

export function useCart() {
  const router = useRouter();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const updateCartItemsSelection = useUpdateCartItemsSelection();
  const { itemCount, cart, isLoading, error } = useCartSummary();
  const { handleError } = useErrorHandler();

  const cartItems = cart?.cart_items;
  const allCartItemIds = useMemo(
    () => cartItems?.map((item) => item.id) ?? [],
    [cartItems],
  );

  // The user's explicit selection. `null` until they first change it, which
  // means "everything in the cart" — so all items are selected when the cart
  // first loads, while items added after a manual change are not.
  const [chosenItemIds, setChosenItemIds] = useState<ReadonlySet<string> | null>(
    null,
  );

  // Effective selection, limited to items still in the cart.
  const selectedItemIds = useMemo(() => {
    if (chosenItemIds === null) return new Set(allCartItemIds);
    return new Set(allCartItemIds.filter((id) => chosenItemIds.has(id)));
  }, [allCartItemIds, chosenItemIds]);

  if (error) handleError(error);

  // Selection handlers
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      setChosenItemIds((prev) => {
        const next = new Set(prev ?? allCartItemIds);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
    },
    [allCartItemIds],
  );

  const selectAllItems = useCallback(() => {
    if (allCartItemIds.length > 0) {
      setChosenItemIds(new Set(allCartItemIds));
    }
  }, [allCartItemIds]);

  const deselectAllItems = useCallback(() => {
    setChosenItemIds(new Set());
  }, []);

  // Derived selection state
  const selectedItems = useMemo(() => {
    if (!cartItems) return [];
    return cartItems.filter((item) => selectedItemIds.has(item.id));
  }, [cartItems, selectedItemIds]);

  const selectedCount = selectedItems.length;
  const allSelected = Boolean(
    cart?.cart_items &&
      cart.cart_items.length > 0 &&
      selectedCount === cart.cart_items.length,
  );
  const someSelected = selectedCount > 0 && !allSelected;

  // Calculate totals for selected items only
  const selectedTotals = useMemo(() => {
    if (selectedItems.length === 0) {
      return { subtotal: 0, shipping: 0, total: 0 };
    }
    const totals = CartServiceMapper.calculateCartTotals(selectedItems);
    return {
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.subtotal + totals.shipping,
    };
  }, [selectedItems]);

  const updateQuantity = (itemId: string, quantity: number) => {
    updateCartItem.mutate({ itemId, update: { quantity } });
  };

  const removeItem = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const checkout = async () => {
    if (!cart || selectedItems.length === 0) return;

    await updateCartItemsSelection.mutateAsync({
      cartId: cart.id,
      selectedItemIds: [...selectedItemIds],
    });

    const totals = CartServiceMapper.calculateCartTotals(selectedItems);
    AnalyticsService.track(
      "begin_checkout",
      mapBeginCheckoutEvent({
        items: selectedItems,
        value: totals.subtotal + totals.shipping,
      }),
    );

    router.push(`/checkout?cartId=${cart.id}`);
  };

  const totals = cart
    ? CartServiceMapper.calculateCartTotals(cart.cart_items)
    : null;
  const total = totals ? totals.subtotal + totals.shipping : 0;

  // Can only checkout if at least one item is selected
  const canCheckout = selectedCount > 0;

  return {
    cart,
    itemCount,
    isLoading,
    total,
    updateQuantity,
    removeItem,
    checkout,
    // Selection state and handlers
    selectedItemIds,
    selectedItems,
    selectedCount,
    allSelected,
    someSelected,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    selectedTotals,
    canCheckout,
  };
}
