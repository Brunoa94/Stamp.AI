"use client";

import { createContext, ReactNode, useContext, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutFormSchema, type CheckoutFormDataT } from "@/schemas/checkout";
import { TEST_BILLING_DATA } from "../constants/testData";

// Re-export type for convenience
export type CheckoutFormData = CheckoutFormDataT;

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
      billing: TEST_BILLING_DATA,
      useShippingAddress: false,
      paymentMethod: "stripe",
      ...defaultValues,
    },
    mode: "onChange", // Validate on change to enable/disable payment buttons in real-time
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

