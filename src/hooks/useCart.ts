import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/services/cartService";
import { AddToCartInput, UpdateCartItemInput } from "@/types/cart";
import { useUser } from "./useAuth";

/**
 * Hook to get or create cart for current user/session
 */
export function useCart() {
  const { data: user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["cart", { userId }],
    queryFn: async () => {
      // Get or create cart
      const cart = await CartService.getOrCreateCart(userId, undefined);
      // Get cart with items
      return await CartService.getCart(cart.id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for cart mutations (add, update, remove)
 */
export function useCartMutations() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;

  const addToCart = useMutation({
    mutationFn: async (item: AddToCartInput) => {
      const cart = await CartService.getOrCreateCart(userId, undefined);
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
      const cart = await CartService.getOrCreateCart(userId, undefined);
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
  const { data: cart } = useCart();

  if (!cart) {
    return {
      subtotal: 0,
      itemCount: 0,
      items: [],
    };
  }

  return CartService.calculateCartSummary(cart);
}
