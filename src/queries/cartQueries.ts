import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/services/cartService";
import { AddToCartInput, UpdateCartItemInput } from "@/types/cart";
import { useUser } from "@/hooks/useAuth";

/**
 * Hook to get or create cart for current user/session
 */
export function useCart() {
  const { data: user } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;

  return useQuery({
    queryKey: ["cart", { userId }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      // Get or create cart
      const cart = await CartService.getOrCreateCart(userId, undefined, userEmail);
      // Get cart with items
      return CartService.getCart(cart.id);
    },
    enabled: !!userId, // Only run query when userId exists
    retry: 1,
  });
}

/**
 * Get cart by ID (used in checkout)
 */
export function useCartById(cartId: string | null) {
  return useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => CartService.getCart(cartId!),
    enabled: !!cartId,
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
    error
  };
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;

  return useMutation({
    mutationFn: async (item: AddToCartInput) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const cart = await CartService.getOrCreateCart(userId, undefined, userEmail);
      return await CartService.addToCart(cart.id, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * Update cart item
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

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
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => {
      return CartService.removeCartItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * Clear all items from cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const cart = await CartService.getOrCreateCart(userId, undefined, userEmail);
      return await CartService.clearCart(cart.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
