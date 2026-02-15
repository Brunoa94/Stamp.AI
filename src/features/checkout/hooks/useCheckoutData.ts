import { useOrder } from "@/hooks/useOrder";
import { useOrderItems } from "@/hooks/useOrderItems";
import { useCustomProduct } from "@/hooks/useCustomProduct";
import { CheckoutSubscriberContextState } from "../context/CheckoutContextSubscriber/types";
import { useEffect, useState } from "react";
import { buildCustomization, buildLineItems } from "../context/CheckoutContextSubscriber/computeState";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useQuery } from "@tanstack/react-query";
import { CartService } from "@/services/cartService";
import { OrderService } from "@/services/orderService";
import { OrderItemService } from "@/services/orderItemService";
import { useUser } from "@/hooks/useAuth";

export interface CheckoutStore {
  getState: () => CheckoutSubscriberContextState;
  setState: (newState: CheckoutSubscriberContextState) => void;
  subscribe: (listener: () => void) => () => void;
}

interface UseCheckoutDataResult {
  isLoading: boolean;
  error: Error | null;
}

export function useCheckoutData(orderId: string | null, cartId: string | null | undefined, store: CheckoutStore): UseCheckoutDataResult {
  const { data: user } = useUser();
  const {handleError} = useErrorHandler();
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Fetch cart if cartId is provided
  const { data: cart, isLoading: isLoadingCart, error: cartError } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) throw new Error("Cart ID is required");
      return await CartService.getCart(cartId);
    },
    enabled: !!cartId && !orderId, // Only fetch if we have cartId and no orderId
  });

  // Create order from cart
  useEffect(() => {
    if (cart && !createdOrderId && !orderId && user?.id) {
      const createOrderFromCart = async () => {
        try {
          const cartSummary = CartService.calculateCartSummary(cart);

          // Generate a unique order number
          const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

          // Create order from cart
          const newOrder = await OrderService.createOrder({
            user_id: user.id,
            customer_email: user.email || "",
            order_number: orderNumber,
            status: "pending",
            payment_status: "pending",
            subtotal: cartSummary.subtotal,
            shipping_cost: 5.99,
            discount_amount: 0,
            total_amount: cartSummary.subtotal + 5.99,
          });

          console.log("✅ Order created from cart:", newOrder.id);

          // Create order items from cart items
          if (cart.cart_items && cart.cart_items.length > 0) {
            const orderItems = cart.cart_items.map((cartItem) => {
              const totalPrice = cartItem.unit_price * cartItem.quantity;
              return {
                order_id: newOrder.id,
                product_id: cartItem.product_id || null,
                variant_id: cartItem.variant_id || null,
                quantity: cartItem.quantity,
                unit_price: cartItem.unit_price,
                total_price: totalPrice,
                custom_image_url: cartItem.custom_image_url || "",
                product_name: cartItem.product?.name || "Custom Product",
                variant_name: cartItem.variant?.name || null,
                design_config: cartItem.custom_image_url ? { custom_image_url: cartItem.custom_image_url } : null,
              };
            });

            await OrderItemService.createOrderItems(orderItems);
            console.log("✅ Order items created:", orderItems.length);
          }

          setCreatedOrderId(newOrder.id);
        } catch (error) {
          console.error("❌ Failed to create order from cart:", error);
          handleError(error as Error);
        }
      };

      createOrderFromCart();
    }
  }, [cart?.id, createdOrderId, orderId, user?.id, user?.email, handleError]);

  // Use either the provided orderId or the created orderId
  const effectiveOrderId = orderId || createdOrderId;

  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useOrder(effectiveOrderId)

  if(orderError) handleError(orderError)

  useEffect(() => {
    if(order) {
      const currentState = store.getState();
      store.setState({...currentState, order});
    }
  }, [order?.id, store]);

  const { data: orderItems, isLoading: isLoadingItems, error: orderItemsError } =
    useOrderItems(orderId);
  
  if(orderItemsError) handleError(orderItemsError)
    
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

  const isLoading = isLoadingCart || isLoadingOrder || isLoadingItems || isLoadingProduct;
  const error = cartError || orderError || productError || null;

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
