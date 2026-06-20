"use client";

import { createContext, ReactNode, useContext, useEffect } from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShippingAddressSchema } from "@/schemas/checkout";
import type { PaymentMethodT } from "@/types/payment";

// Checkout form schema
export const CheckoutFormSchema = z.object({
  // Billing address (required)
  billing: ShippingAddressSchema,

  // Shipping address toggle and data
  useShippingAddress: z.boolean(),
  shipping: ShippingAddressSchema.optional(),

  // Payment method
  paymentMethod: z.enum(["stripe", "paypal"] as const),

  // Promo code
  promoCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

interface CheckoutFormContextValue {
  cartId: string | null;
}

const CheckoutFormContext = createContext<CheckoutFormContextValue | null>(null);

interface CheckoutFormProviderProps {
  children: ReactNode;
  cartId: string | null;
  defaultValues?: Partial<CheckoutFormData>;
}

export function CheckoutFormProvider({
  children,
  cartId,
  defaultValues,
}: CheckoutFormProviderProps) {
  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      useShippingAddress: false,
      paymentMethod: "stripe",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  // Watch for shipping toggle changes
  const useShippingAddress = methods.watch("useShippingAddress");

  // Clear shipping address when toggle is disabled
  useEffect(() => {
    if (!useShippingAddress) {
      methods.setValue("shipping", undefined);
    }
  }, [useShippingAddress, methods]);

  return (
    <CheckoutFormContext.Provider value={{ cartId }}>
      <FormProvider {...methods}>{children}</FormProvider>
    </CheckoutFormContext.Provider>
  );
}

export function useCheckoutFormContext() {
  const context = useContext(CheckoutFormContext);
  if (!context) {
    throw new Error(
      "useCheckoutFormContext must be used within CheckoutFormProvider"
    );
  }
  return context;
}
