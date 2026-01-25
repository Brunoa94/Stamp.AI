import { useOrder } from "@/hooks/useOrder";
import { useOrderItems } from "@/hooks/useOrderItems";
import { useCustomProduct } from "@/hooks/useCustomProduct";
import { CheckoutSubscriberContextState } from "../context/CheckoutContextSubscriber/types";
import { useEffect } from "react";
import { buildCustomization, buildLineItems } from "../context/CheckoutContextSubscriber/computeState";

export interface CheckoutStore {
  getState: () => CheckoutSubscriberContextState;
  setState: (newState: CheckoutSubscriberContextState) => void;
  subscribe: (listener: () => void) => () => void;
}

interface UseCheckoutDataResult {
  isLoading: boolean;
  error: Error | null;
}

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

  // Determine the correct product_id to fetch
  // Priority: order.product_id > orderItems[0].design_config.printify_product_id
  const designConfig = orderItems?.[0]?.design_config as { printify_product_id?: string } | null;
  const productIdToFetch =
    order?.product_id ||
    designConfig?.printify_product_id ||
    null;

  const {
    data: customProduct,
    isLoading: isLoadingProduct,
    error: productError,
  } = useCustomProduct(productIdToFetch)

  useEffect(() => {
    if(customProduct && orderItems?.[0] && order) {
      const currentState = store.getState();
      const orderItem = orderItems[0];
      if (!orderItem.variant_id || orderItem.variant_id === '0') {
        const firstEnabledVariant = customProduct.variants?.find((v: any) => v.is_enabled);
        const selectedVariantId = firstEnabledVariant?.id || customProduct.variants?.[0]?.id;
        
        if (selectedVariantId) {
          const updatedOrderItems = [{
            ...orderItem,
            variant_id: String(selectedVariantId),
          }];

          store.setState({...currentState, order, customProduct, orderItems: updatedOrderItems});
          
          return;
        }
      }

      store.setState({...currentState, order, orderItems, customProduct});
    }
  }, [customProduct?.id, orderItems?.[0]?.id, store]);

  const isLoading = isLoadingOrder || isLoadingItems || isLoadingProduct;
  const error = orderError || productError || null;

  useEffect(() => {
    const currentState = store.getState();

    if (currentState.isLoading !== isLoading || currentState.error !== error) {
      store.setState({ ...currentState, isLoading, error });
    }
  }, [isLoading, error, store]);

  // Compute derived state (subtotal, shippingCost, discount, orderAmount, lineItems)
  // whenever order, orderItems, or customProduct changes
  useEffect(() => {
    // Only compute if we have data
    if (!order && !orderItems?.length && !customProduct) {
      console.log('⚠️ useCheckoutData: No data available yet, skipping computed state update');
      return;
    }

    const currentState = store.getState();

    // Build customization from the current data
    const customization = buildCustomization(order || null, orderItems || null, customProduct || null);

    if (!customization) {
      console.log('⚠️ useCheckoutData: No customization available, skipping computed state update');
      return;
    }

    // Calculate order amounts with fallbacks
    // Note: Database values come as strings for DECIMAL fields, so we need to parse them
    const subtotal = order?.subtotal ? Number(order.subtotal) : customization.price * customization.quantity;
    const shippingCost = order?.shipping_cost ? Number(order.shipping_cost) : 5.99;
    const discount = order?.discount_amount ? Number(order.discount_amount) : 0;
    const orderAmount = subtotal + shippingCost - discount;

    // Build line items for payment
    const lineItems = buildLineItems(customization);

    console.log('📊 useCheckoutData: Computing derived state:', {
      subtotal,
      shippingCost,
      discount,
      orderAmount,
      has_lineItems: !!lineItems,
    });

    // Update the store with computed values
    store.setState({
      ...currentState,
      customization,
      subtotal,
      shippingCost,
      discount,
      orderAmount,
      lineItems,
    });
  }, [order?.id, orderItems?.length, customProduct?.id, order, orderItems, customProduct, store]);

  return {
    isLoading,
    error,
  };
}
