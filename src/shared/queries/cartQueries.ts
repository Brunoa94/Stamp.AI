import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/shared/services/cartService";
import { AddToCartInput, UpdateCartItemInput } from "@/shared/types/cart";
import { useUser } from "@/shared/queries/authQueries";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import {
  LOCAL_CART_UPDATED_EVENT,
  LocalCartStorageService,
  type LocalCartItemT,
} from "@/shared/services/localCartStorageService";
import {
  LOCAL_CART_ID,
  mapLocalCartToCartWithItems,
} from "@/shared/mappers/localCartMapper";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";

/**
 * A guest's local cart (localStorage), kept in sync with changes from this
 * tab and other tabs. `null` until hydrated, so the server render and the
 * first client render agree.
 */
export function useLocalCartItems(): LocalCartItemT[] | null {
  const [items, setItems] = useState<LocalCartItemT[] | null>(null);

  useEffect(() => {
    const read = () => setItems(LocalCartStorageService.getItems());
    read();
    window.addEventListener(LOCAL_CART_UPDATED_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(LOCAL_CART_UPDATED_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return items;
}

/**
 * The current cart. Registered users get their database cart; guests (no
 * session or an anonymous one) always get the local cart, even when an
 * earlier payment attempt left a database cart behind.
 */
function useCart() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const isRegistered = isRegisteredUser(user);
  const userId = isRegistered ? user.id : undefined;
  const userEmail = isRegistered ? user.email : undefined;
  const localItems = useLocalCartItems();

  const query = useQuery({
    queryKey: ["cart", { userId }],
    queryFn: async () => {
      const cart = await CartService.getOrCreateCart(userId, undefined, userEmail);
      return CartService.getCart(cart.id);
    },
    enabled: !!userId,
    retry: 1,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const localCart = useMemo(
    () => (localItems ? mapLocalCartToCartWithItems(localItems) : undefined),
    [localItems],
  );

  if (isUserLoading) {
    return { data: undefined, isLoading: true, error: null };
  }
  if (!isRegistered) {
    return { data: localCart, isLoading: localItems === null, error: null };
  }
  return { data: query.data, isLoading: query.isLoading, error: query.error };
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
    ...CartServiceMapper.mapItemsToCartSummary(cart?.cart_items ?? []),
    error,
  };
}

/**
 * Add item to a registered user's database cart. Guests add to the local
 * cart instead (LocalCartStorageService).
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (item: AddToCartInput) => {
      if (!isRegisteredUser(user)) {
        throw new Error("Only registered users have a database cart");
      }

      const cart = await CartService.getOrCreateCart(user.id, undefined, user.email);
      return await CartService.addToCart(cart.id, item);
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
 * Update cart item (the local cart item for guests)
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({
      itemId,
      update,
    }: {
      itemId: string;
      update: UpdateCartItemInput;
    }) => {
      if (!isRegisteredUser(user)) {
        LocalCartStorageService.updateQuantity(itemId, update.quantity);
        return;
      }
      await CartService.updateCartItem(itemId, update);
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
 * Remove item from cart (from the local cart for guests)
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!isRegisteredUser(user)) {
        LocalCartStorageService.removeItem(itemId);
        return;
      }
      await CartService.removeCartItem(itemId);
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
 * Update cart items selection (persist which items are selected for checkout).
 * The local cart keeps its selection in localStorage.
 */
export function useUpdateCartItemsSelection() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({
      cartId,
      selectedItemIds,
    }: {
      cartId: string;
      selectedItemIds: string[];
    }) => {
      if (cartId === LOCAL_CART_ID) {
        LocalCartStorageService.setSelection(selectedItemIds);
        return;
      }
      await CartService.updateCartItemsSelection(cartId, selectedItemIds);
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
