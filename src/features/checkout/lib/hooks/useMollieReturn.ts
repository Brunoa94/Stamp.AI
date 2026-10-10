import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { INITIAL_PAYMENT_RETURN_STATE } from "../constants/paymentReturn";
import { processMollieReturn } from "../services/mollieReturnProcessor";
import type { MollieReturnStateI } from "../types/paymentReturn";
import { useOrderFulfillment } from "./useOrderFulfillment";
import { usePaymentReturn } from "./usePaymentReturn";
import { useVerifyMolliePayment } from "@/shared/queries/mollieQueries";

export function useMollieReturn(): MollieReturnStateI {
  const t = useTranslations("checkout.returns.mollie");
  const searchParams = useSearchParams();
  const fulfillOrder = useOrderFulfillment();
  const verifyMolliePayment = useVerifyMolliePayment();

  return usePaymentReturn<MollieReturnStateI>(
    { ...INITIAL_PAYMENT_RETURN_STATE, providerStatus: null, cartId: null },
    (user, update) =>
      processMollieReturn(
        searchParams.get("payment_id"),
        verifyMolliePayment.mutateAsync,
        { user, t, fulfillOrder, update },
      ),
  );
}
