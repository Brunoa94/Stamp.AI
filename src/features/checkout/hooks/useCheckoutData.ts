import { CheckoutSubscriberContextState } from "../context/CheckoutContextSubscriber/types";
import { useEffect } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useCartById } from "@/queries/cartQueries";
import { useOrder } from "@/queries/orderQueries";
import { useSearchParams } from "next/navigation";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { CartItem } from "@/types/cart";
import { buildPrintifyLineItems } from "../mappers/printifyLineItemsMapper";

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
  const retryOrderId = searchParams.get("retry_order_id");
  const isRetryFlow = !!retryOrderId;

  // Fetch cart with items
  const {
    data: cart,
    isLoading,
    error,
  } = useCartById(cartId);

  const {
    data: retryOrder,
    isLoading: isRetryOrderLoading,
    error: retryOrderError,
  } = useOrder(retryOrderId);

  if (error) handleError(error as Error);
  if (retryOrderError) handleError(retryOrderError as Error);

  const mapRetryOrderItemsToCartItems = (orderId: string, orderItems: any[]): CartItem[] => {
    return orderItems.map((item, index) => ({
      id: item.id,
      cart_id: orderId,
      product_id: item.product_id,
      design_id: item.design_id,
      variant_id: item.variant_id,
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      custom_image_url: item.custom_image_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product_name: item.product_name || `Retry Item ${index + 1}`,
      // Ensure line item mapper can create valid retry payloads even when product relation is missing
      product: item.product_id
        ? {
            id: item.product_id,
            name: item.product_name || `Retry Item ${index + 1}`,
            slug: String(item.product_name || `retry-item-${index + 1}`)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
            base_price: item.unit_price ?? 0,
            blueprint_id: null,
            print_provider_id: null,
            print_areas: null,
          }
        : undefined,
      variant: item.variant_name
        ? {
            id: item.variant_id || "",
            name: item.variant_name,
          }
        : undefined,
    }));
  };

  const pickString = (obj: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  };

  const normalizeRetryShippingAddress = (
    order: {
      shipping_address?: unknown;
      billing_address?: unknown;
      customer_name?: string | null;
      customer_email?: string | null;
      customer_phone?: string | null;
    },
  ): ShippingAddressT | null => {
    const source =
      (order.shipping_address && typeof order.shipping_address === "object"
        ? (order.shipping_address as Record<string, unknown>)
        : null) ||
      (order.billing_address && typeof order.billing_address === "object"
        ? (order.billing_address as Record<string, unknown>)
        : null);

    const [nameFirst = "", ...nameRest] = (order.customer_name || "").trim().split(" ");
    const nameLast = nameRest.join(" ");

    if (!source && !order.customer_email && !order.customer_name && !order.customer_phone) {
      return null;
    }

    return {
      first_name: source ? pickString(source, "first_name", "firstName") : nameFirst,
      last_name: source ? pickString(source, "last_name", "lastName") : nameLast,
      email: source
        ? pickString(source, "email") || (order.customer_email ?? "")
        : (order.customer_email ?? ""),
      phone: source
        ? pickString(source, "phone") || (order.customer_phone ?? "")
        : (order.customer_phone ?? ""),
      country: source ? pickString(source, "country") || "US" : "US",
      region: source ? pickString(source, "region", "state") : "",
      address1: source ? pickString(source, "address1", "line1", "address") : "",
      address2: source ? pickString(source, "address2", "line2") : "",
      city: source ? pickString(source, "city") : "",
      zip: source ? pickString(source, "zip", "postal_code", "postalCode") : "",
    };
  };

  const toNumber = (value: number | null | undefined) => {
    return typeof value === "number" ? value : 0;
  };

  // Update cart items and calculate costs
  useEffect(() => {
    if (isRetryFlow && retryOrder?.order_items) {
      const currentState = store.getState();
      const cartItems = mapRetryOrderItemsToCartItems(retryOrder.id, retryOrder.order_items);
      const lineItems = buildPrintifyLineItems(cartItems);

      const subtotal = toNumber(retryOrder.subtotal);
      const shippingCost = toNumber(retryOrder.shipping_cost);
      const discount = toNumber(retryOrder.discount_amount);
      const totalFromOrder = toNumber(retryOrder.total_amount);
      const calculatedTotal = subtotal + shippingCost - discount;
      const total = totalFromOrder > 0 ? totalFromOrder : calculatedTotal;

      store.setState({
        ...currentState,
        cart: null,
        cartItems,
        lineItems,
        shippingAddress:
          normalizeRetryShippingAddress(retryOrder) ||
          currentState.shippingAddress,
        subtotal,
        shippingCost,
        discount,
        total,
        orderAmount: total,
        isLoading: false,
        error: null,
      });

      return;
    }

    if (cart?.cart_items) {
      const currentState = store.getState();
      const cartItems = cart.cart_items;
      const lineItems = buildPrintifyLineItems(cartItems);

      // Calculate costs
      const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const shippingCost = 0.01;
      const discount = 0;
      const total = subtotal + shippingCost - discount;
      const orderAmount = total; // Keep orderAmount for backward compatibility

      store.setState({
        ...currentState,
        cart,
        cartItems,
        lineItems,
        subtotal,
        shippingCost,
        discount,
        total,
        orderAmount,
        isLoading: false,
        error: null,
      });
    }
  }, [isRetryFlow, retryOrder, cart, store]);

  // Update loading and error state
  useEffect(() => {
    const currentState = store.getState();
    const effectiveLoading = isRetryFlow ? isRetryOrderLoading : isLoading;
    const effectiveError = (isRetryFlow ? retryOrderError : error) as Error | null;

    if (
      currentState.isLoading !== effectiveLoading ||
      currentState.error !== effectiveError
    ) {
      store.setState({
        ...currentState,
        isLoading: effectiveLoading,
        error: effectiveError,
      });
    }
  }, [isRetryFlow, isLoading, isRetryOrderLoading, error, retryOrderError, store]);

  const effectiveLoading = isRetryFlow ? isRetryOrderLoading : isLoading;
  const effectiveError = (isRetryFlow ? retryOrderError : error) as Error | null;

  return {
    isLoading: effectiveLoading,
    error: effectiveError,
  };
}
