import { useEffect, useState } from "react";
import { useOrder } from "@/queries/orderQueries";
import type { PaymentMethodT } from "@/types/payment";

const MAX_CONFIRMATION_POLL_ATTEMPTS = 12;
const CONFIRMATION_POLL_INTERVAL_MS = 5000;

interface UseCheckoutOrderConfirmationParamsI {
  paymentStatus: "idle" | "success" | "error";
  selectedPaymentMethod: PaymentMethodT;
  checkoutOrderId: string | null;
}

interface UseCheckoutOrderConfirmationResultI {
  shouldShowStripeVerificationLoading: boolean;
  successTitle: string;
  successSubtitle: string;
  successStatusValue: string;
}

export function useCheckoutOrderConfirmation({
  paymentStatus,
  selectedPaymentMethod,
  checkoutOrderId,
}: UseCheckoutOrderConfirmationParamsI): UseCheckoutOrderConfirmationResultI {
  const [confirmationPollAttempts, setConfirmationPollAttempts] = useState(0);

  const shouldPollOrderConfirmation =
    paymentStatus === "success" &&
    !!checkoutOrderId &&
    confirmationPollAttempts < MAX_CONFIRMATION_POLL_ATTEMPTS;

  const { data: checkoutOrder, dataUpdatedAt } = useOrder(
    paymentStatus === "success" ? checkoutOrderId : null,
    shouldPollOrderConfirmation ? CONFIRMATION_POLL_INTERVAL_MS : false,
  );

  const normalizedOrderStatus = (checkoutOrder?.status ?? "")
    .toString()
    .toLowerCase();
  const normalizedPaymentStatus = (checkoutOrder?.payment_status ?? "")
    .toString()
    .toLowerCase();

  const isStripePaymentPersisted =
    normalizedPaymentStatus === "paid" ||
    normalizedPaymentStatus === "succeeded" ||
    normalizedPaymentStatus === "completed" ||
    (normalizedOrderStatus !== "" && normalizedOrderStatus !== "waiting_payment");

  const shouldShowStripeVerificationLoading =
    paymentStatus === "success" &&
    selectedPaymentMethod === "stripe" &&
    !isStripePaymentPersisted;

  const isOrderConfirmed = normalizedOrderStatus === "confirmed";

  useEffect(() => {
    if (paymentStatus !== "success") {
      setConfirmationPollAttempts(0);
      return;
    }

    if (isOrderConfirmed) {
      setConfirmationPollAttempts(MAX_CONFIRMATION_POLL_ATTEMPTS);
      return;
    }

    if (checkoutOrderId && dataUpdatedAt > 0) {
      setConfirmationPollAttempts((prev) => prev + 1);
    }
  }, [paymentStatus, isOrderConfirmed, checkoutOrderId, dataUpdatedAt]);

  useEffect(() => {
    setConfirmationPollAttempts(0);
  }, [checkoutOrderId]);

  return {
    shouldShowStripeVerificationLoading,
    successTitle: isOrderConfirmed ? "Order Confirmed" : "Payment Received",
    successSubtitle: isOrderConfirmed
      ? "Your custom masterpiece is officially in the queue. We're warming up the ink jets right now."
      : "Your payment was successful. We’re finalizing production details and will confirm your order shortly.",
    successStatusValue: isOrderConfirmed ? "Confirmed" : "Finalizing",
  };
}