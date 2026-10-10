import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { INITIAL_PAYMENT_RETURN_STATE } from "../constants/paymentReturn";
import { processPayPalReturn } from "../services/payPalReturnProcessor";
import type { PayPalReturnStateI } from "../types/paymentReturn";
import { useOrderFulfillment } from "./useOrderFulfillment";
import { usePaymentReturn } from "./usePaymentReturn";

export function usePayPalReturn(): PayPalReturnStateI {
  const t = useTranslations("checkout.returns.paypal");
  const searchParams = useSearchParams();
  const fulfillOrder = useOrderFulfillment();

  return usePaymentReturn<PayPalReturnStateI>(
    { ...INITIAL_PAYMENT_RETURN_STATE, captureId: null },
    (user, update) =>
      processPayPalReturn(
        {
          token: searchParams.get("token"),
          payerId: searchParams.get("PayerID"),
        },
        { user, t, fulfillOrder, update },
      ),
  );
}
