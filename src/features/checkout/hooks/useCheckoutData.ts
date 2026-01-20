import { useOrder } from "@/hooks/useOrder";
import { useOrderItems } from "@/hooks/useOrderItems";
import { useCustomProduct } from "@/hooks/useCustomProduct";

interface UseCheckoutDataResult {
  order: any;
  orderItems: any[];
  customProduct: any;
  isLoading: boolean;
  error: Error | null;
}

// Stable empty array reference to prevent re-renders
const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook to fetch all checkout-related data
 * Handles loading states and error aggregation
 */
export function useCheckoutData(orderId: string | null): UseCheckoutDataResult {
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useOrder(orderId);

  const { data: orderItems, isLoading: isLoadingItems } =
    useOrderItems(orderId);

  const {
    data: customProduct,
    isLoading: isLoadingProduct,
    error: productError,
  } = useCustomProduct(order?.product_id);

  const isLoading = isLoadingOrder || isLoadingItems || isLoadingProduct;
  const error = orderError || productError || null;

  // Use stable empty array reference to prevent infinite re-renders
  const stableOrderItems = orderItems || EMPTY_ARRAY;

  return {
    order,
    orderItems: stableOrderItems,
    customProduct,
    isLoading,
    error,
  };
}
