import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export interface CreatePaymentIntentPayloadI {
  amount: number;
  currency?: string;
  line_items: PrintifyLineItem[];
  shipping_address: ShippingAddressT;
  metadata?: Record<string, unknown>;
  payment_method?: string;
  confirm?: boolean;
}

export interface CreatePaymentIntentResponseI {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

export function useCreatePaymentIntent() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ["stripe", "create-payment-intent"],
    mutationFn: async (
      payload: CreatePaymentIntentPayloadI,
    ): Promise<CreatePaymentIntentResponseI> => {
      const supabase = createClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session) {
        throw new Error("You must be logged in to complete checkout");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: payload,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.clientSecret || !data?.paymentIntentId) {
        throw new Error("No payment data received");
      }

      return data as CreatePaymentIntentResponseI;
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
