import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { INITIAL_PAYMENT_RETURN_STATE } from "../constants/paymentReturn";
import { processStripeReturn } from "../services/stripeReturnProcessor";
import type { PaymentReturnStateI } from "../types/paymentReturn";
import { useOrderFulfillment } from "./useOrderFulfillment";
import { usePaymentReturn } from "./usePaymentReturn";

export function useStripeReturn(): PaymentReturnStateI {
  const t = useTranslations("checkout.returns.stripe");
  const searchParams = useSearchParams();
  const fulfillOrder = useOrderFulfillment();

  return usePaymentReturn(INITIAL_PAYMENT_RETURN_STATE, (user, update) =>
    processStripeReturn(searchParams.get("payment_intent"), {
      user,
      t,
      fulfillOrder,
      update,
    }),
  );
}
