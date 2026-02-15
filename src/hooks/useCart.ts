import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/services/cartService";
import { AddToCartInput, CartWithItems, UpdateCartItemInput } from "@/types/cart";
import { useUser } from "./useAuth";
import { OrderService } from "@/services/orderService";
import { UserI } from "@/shared-types";

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
 * Hook for cart mutations (add, update, remove)
 */
export function useCartMutations() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;
  const userEmail = user?.email;

  const addToCart = useMutation({
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

  const updateCartItem = useMutation({
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

  const removeCartItem = useMutation({
    mutationFn: (itemId: string) => {
      return CartService.removeCartItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const clearCart = useMutation({
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

  return {
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };
}

/**
 * Hook to get cart summary (totals, item count)
 */
export function useCartSummary() {
  const { data: cart, isLoading, error } = useCart();
  
  return{
    cart,
    isLoading,
    ...CartService.calculateCartSummary(cart),
    error
  }
}
