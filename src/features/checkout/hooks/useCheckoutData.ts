import { useOrder } from "@/hooks/useOrder";
import { useOrderItems } from "@/hooks/useOrderItems";
import { useCustomProduct } from "@/hooks/useCustomProduct";
import { CheckoutSubscriberContextState } from "../context/CheckoutContextSubscriber/types";
import { useEffect } from "react";

export interface CheckoutStore {
  getState: () => CheckoutSubscriberContextState;
  setState: (newState: CheckoutSubscriberContextState) => void;
  subscribe: (listener: () => void) => () => void;
}

interface UseCheckoutDataResult {
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch all checkout-related data
 * Handles loading states and error aggregation
 */
export function useCheckoutData(orderId: string | null, store: CheckoutStore): UseCheckoutDataResult {
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useOrder(orderId)

  useEffect(() => {
    if(order) {
      const currentState = store.getState();
      store.setState({...currentState, order});
    }
  }, [order?.id, store]);

  const { data: orderItems, isLoading: isLoadingItems } =
    useOrderItems(orderId);

  useEffect(() => {
    if(orderItems) {
      const currentState = store.getState();
      store.setState({...currentState, orderItems});
    }
  }, [orderItems?.length, store]);

  const {
    data: customProduct,
    isLoading: isLoadingProduct,
    error: productError,
  } = useCustomProduct(order?.product_id)

  useEffect(() => {
    if(customProduct) {
      const currentState = store.getState();
      store.setState({...currentState, customProduct});
    }
  }, [customProduct?.id, store]);

  const isLoading = isLoadingOrder || isLoadingItems || isLoadingProduct;
  const error = orderError || productError || null;

  return {
    isLoading,
    error,
  };
}
