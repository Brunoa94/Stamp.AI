import { CheckoutSubscriberContextState } from "../context/CheckoutContextSubscriber/types";
import { useEffect } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useCartById } from "@/queries/cartQueries";
import { useSearchParams } from "next/navigation";

export interface CheckoutStore {
  getState: () => CheckoutSubscriberContextState;
  setState: (newState: CheckoutSubscriberContextState) => void;
  subscribe: (listener: () => void) => () => void;
}

interface UseCheckoutDataResult {
  isLoading: boolean;
  error: Error | null;
}

export function useCheckoutData(store: CheckoutStore): UseCheckoutDataResult {
  const { handleError } = useErrorHandler();
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");

  // Fetch cart with items
  const {
    data: cart,
    isLoading,
    error,
  } = useCartById(cartId);

  if (error) handleError(error as Error);

  // Update cart items and calculate costs
  useEffect(() => {
    console.log("HOOK CART ", cart)
    if (cart?.cart_items) {
      const currentState = store.getState();
      const cartItems = cart.cart_items;

      // Calculate costs
      const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const shippingCost = 5.99;
      const discount = 0;
      const orderAmount = subtotal + shippingCost - discount;

      store.setState({
        ...currentState,
        cart,
        cartItems,
        subtotal,
        shippingCost,
        discount,
        orderAmount,
        isLoading: false,
        error: null,
      });
    }
  }, [cart, store]);

  // Update loading and error state
  useEffect(() => {
    const currentState = store.getState();

    if (currentState.isLoading !== isLoading || currentState.error !== error) {
      store.setState({
        ...currentState,
        isLoading,
        error: error as Error | null
      });
    }
  }, [isLoading, error, store]);

  return {
    isLoading,
    error: error as Error | null,
  };
}
