/** FOR FUTURE: DECOMPOSE THIS >HOOK IN SMALLER PIECES */

/**
 * useCart
 *
 * Orchestration hook for the cart page. Wraps the shared cart query layer
 * and exposes the data plus the quantity/remove/checkout handlers the UI
 * needs, keeping CartContent purely presentational.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCartSummary,
  useRemoveCartItem,
  useUpdateCartItem,
  useUpdateCartItemsSelection,
} from "@/queries/cartQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { AnalyticsService } from "@/services/analyticsService";
import { mapBeginCheckoutEvent } from "@/features/analytics/mappers/ecommerceMappers";

export function useCart() {
  const router = useRouter();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const updateCartItemsSelection = useUpdateCartItemsSelection();
  const { itemCount, cart, isLoading, error } = useCartSummary();
  const { handleError } = useErrorHandler();

  // Selection state - track selected item IDs
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  // Memoize all cart item IDs to avoid repeated mapping
  const allCartItemIds = cart?.cart_items?.map((item) => item.id) ?? [];

  // Auto-select all items when cart loads for the first time
  useEffect(() => {
    if (allCartItemIds.length > 0 && selectedItemIds.size === 0) {
      setSelectedItemIds(new Set(allCartItemIds));
    }
  }, [allCartItemIds]);

  // Clean up selection when items are removed from cart
  useEffect(() => {
    if (allCartItemIds.length > 0) {
      const validIds = new Set(allCartItemIds);
      setSelectedItemIds((prev) => {
        const cleaned = new Set([...prev].filter((id) => validIds.has(id)));
        return cleaned.size !== prev.size ? cleaned : prev;
      });
    }
  }, [allCartItemIds]);

  if (error) handleError(error);

  // Selection handlers
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (allCartItemIds.length > 0) {
      setSelectedItemIds(new Set(allCartItemIds));
    }
  }, [allCartItemIds]);

  const deselectAllItems = useCallback(() => {
    setSelectedItemIds(new Set());
  }, []);

  // Derived selection state
  const selectedItems = useMemo(() => {
    if (!cart?.cart_items) return [];
    return cart.cart_items.filter((item) => selectedItemIds.has(item.id));
  }, [cart?.cart_items, selectedItemIds]);

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
