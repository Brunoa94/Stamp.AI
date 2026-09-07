import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/services/cartService";
import { AddToCartInput, UpdateCartItemInput } from "@/types/cart";
import { useUser } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { GuestProductStorageService } from "@/features/checkout/lib/services/guestProductStorageService";

/**
 * Hook to safely get session ID only on client-side.
 * Returns null on server and during initial hydration to prevent mismatches.
 * Also returns isHydrated to track hydration state.
 */
function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only access sessionStorage after hydration is complete
    setSessionId(GuestProductStorageService.getSessionId());
    setIsHydrated(true);
  }, []);

  return { sessionId, isHydrated };
}

/**
 * Hook to get or create cart for current user/session.
 * Supports both authenticated users (via userId) and guests (via sessionId).
 */
function useCart() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;
  // Get session ID safely (null on server, populated after hydration)
  const { sessionId, isHydrated } = useSessionId();

  const query = useQuery({
    queryKey: ["cart", { userId, sessionId }],
    queryFn: async () => {
      // Support both authenticated and guest users
      if (!userId && !sessionId) {
        throw new Error("No user ID or session ID available");
      }
      // Get or create cart (prefers userId if available)
      const cart = await CartService.getOrCreateCart(
        userId || undefined,
        userId ? undefined : sessionId || undefined,
        userEmail,
      );
      // Get cart with items
      return CartService.getCart(cart.id);
    },
    enabled: !!(userId || sessionId), // Run when either exists
    retry: 1,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Include hydration state in loading - always show loading until hydrated
  // This prevents hydration mismatch between server (no sessionId) and client (has sessionId)
  return {
    ...query,
    isLoading: !isHydrated || isUserLoading || query.isLoading,
  };
}

/**
 * Get cart by ID (used in checkout)
 */
export function useCartById(cartId: string | null) {
  return useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => CartService.getCart(cartId!),
    enabled: !!cartId,
    refetchOnWindowFocus: true,
    refetchOnMount: "always", // Always refetch on client-side navigation
    staleTime: 0, // Consider data always stale to ensure fresh data
  });
}

/**
 * Hook to get cart summary (totals, item count)
 */
export function useCartSummary() {
  const { data: cart, isLoading, error } = useCart();

  return {
    cart,
    isLoading,
    ...CartService.calculateCartSummary(cart),
    error,
  };
}

/**
 * Add item to cart.
 * Supports both authenticated users (via userId) and guests (via sessionId).
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (item: AddToCartInput) => {
      // Get session ID for guests
      const sessionId = GuestProductStorageService.getSessionId();

      // DEBUG: Log the item received by the mutation
      console.log("[useAddToCart] Mutation called with item:", {
        item,
        userId,
        sessionId,
        hasProductName: "product_name" in item,
        hasUnitPrice: "unit_price" in item,
        productNameValue: item.product_name,
        unitPriceValue: item.unit_price,
        allKeys: Object.keys(item),
      });

      // Support both authenticated and guest users
      if (!userId && !sessionId) {
        throw new Error("No user ID or session ID available");
      }

      // Get or create cart (prefers userId if available)
      const cart = await CartService.getOrCreateCart(
        userId || undefined,
        userId ? undefined : sessionId || undefined,
        userEmail,
      );

      // DEBUG: Log before calling CartService
      console.log("[useAddToCart] Calling CartService.addToCart with:", {
        cartId: cart.id,
        item,
      });

      return await CartService.addToCart(cart.id, item);
    },
    onSuccess: (data) => {
      // DEBUG: Log successful result
      console.log("[useAddToCart] Success, returned data:", data);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      // DEBUG: Log error details
      console.error("[useAddToCart] Error:", error);
      handleError(error);
    },
  });
}

/**
 * Update cart item
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      itemId,
      update,
    }: {
      itemId: string;
      update: UpdateCartItemInput;
    }) => {
      return CartService.updateCartItem(itemId, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (itemId: string) => {
      return CartService.removeCartItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update cart items selection (persist which items are selected for checkout)
 */
export function useUpdateCartItemsSelection() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      cartId,
      selectedItemIds,
    }: {
      cartId: string;
      selectedItemIds: string[];
    }) => {
      return CartService.updateCartItemsSelection(cartId, selectedItemIds);
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Remove a specific set of items from the cart.
 * Used after a successful payment to drop only the items that were ordered,
 * so a partial checkout leaves the unselected items in the cart.
 */
export function useRemoveCartItems() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (itemIds: string[]) => CartService.removeCartItems(itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
