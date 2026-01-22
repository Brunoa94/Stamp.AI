"use client";

import React, { ReactNode } from "react";
import { createContext } from "use-context-selector";
import { useCheckoutData } from "../../hooks/useCheckoutData";
import { useCustomization } from "../../hooks/useCustomization";
import { useCheckoutHandlers } from "@/app/checkout/useCheckoutHandlers";
import { CheckoutContextValue } from "./types";

export const CheckoutContext = createContext<CheckoutContextValue | undefined>(
  undefined,
);

interface CheckoutProviderProps {
  children: ReactNode;
  orderId: string | null;
}

export function CheckoutProvider({ children, orderId }: CheckoutProviderProps) {
  // Fetch all checkout data
  const { order, orderItems, customProduct, isLoading, error } =
    useCheckoutData(orderId);

  // Build customization from fetched data
  const customization = useCustomization({
    order,
    orderItems,
    customProduct,
    isLoading,
  });

  // Checkout flow handlers
  const handlers = useCheckoutHandlers();

  // Calculate order amounts with fallbacks
  const subtotal =
    order?.subtotal || customization.price * customization.quantity;
  const shippingCost = order?.shipping_cost || 5.99;
  const discount = order?.discount_amount || 0;
  const orderAmount = subtotal + shippingCost - discount;

  // Build line items for payment
  const printAreasArray = Object.entries(customization.print_areas)
    .filter(([_position, imageId]) => imageId)
    .map(([position, imageId]) => ({
      position,
      image_id: imageId,
    }));

  const lineItems = [
    {
      product_id: customization.product_id || "",
      variant_id: customization.variant_id,
      quantity: customization.quantity,
      print_areas: printAreasArray,
      print_provider_id: customization.print_provider_id || 99,
    },
  ];

  const value: CheckoutContextValue = {
    // Data state
    order,
    orderItems,
    customProduct,
    isLoading,
    error,

    // Customization
    customization,

    // Checkout handlers state
    ...handlers,

    // Computed values
    subtotal,
    shippingCost,
    discount,
    orderAmount,
    lineItems,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
