"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PaymentError from "../../components/PaymentError";
import { PaymentReturnErrorCard } from "../../components/PaymentReturn/PaymentReturnErrorCard";
import { PaymentReturnProcessingCard } from "../../components/PaymentReturn/PaymentReturnProcessingCard";
import PaymentSuccess from "../../PaymentSuccess/PaymentSuccess";
import { PAYMENT_RETURN_ROUTES } from "@/features/checkout/lib/constants/paymentReturn";
import { usePayPalReturn } from "@/features/checkout/lib/hooks/usePayPalReturn";
import {
  mapPaymentFailureDetails,
  mapPaymentSuccessDetails,
} from "@/features/checkout/lib/mappers/paymentReturnDetailsMapper";

export function PayPalReturnSection() {
  const t = useTranslations("checkout.returns.paypal");
  const router = useRouter();
  const { status, paymentId, captureId, orderNumber, errorMessage } =
    usePayPalReturn();

  const handleRetry = () => router.push(PAYMENT_RETURN_ROUTES.checkout);
  const handleCreateAnother = () =>
    router.push(PAYMENT_RETURN_ROUTES.createAnother);

  switch (status) {
    case "loading":
    case "processing": {
      const isCapturing = status === "processing";
      return (
        <PaymentReturnProcessingCard
          ariaLabel={t("processingAria")}
          title={isCapturing ? t("capturingTitle") : t("processingTitle")}
          description={
            isCapturing ? t("capturingMessage") : t("processingMessage")
          }
        />
      );
    }
    case "success":
      return (
        <PaymentSuccess
          details={mapPaymentSuccessDetails({
            provider: "paypal",
            id: captureId ?? paymentId,
            paymentId,
            orderNumber,
            status: "succeeded",
            totalPaid: t("totalPaid"),
            estimatedDelivery: t("estimatedDelivery"),
          })}
          onCreateAnother={handleCreateAnother}
        />
      );
    case "cancelled":
      return (
        <PaymentError
          details={mapPaymentFailureDetails({
            provider: "paypal",
            paymentId,
            status: t("cancelledStatus"),
            reasonTitle: t("paymentCancelledTitle"),
            reasonMessage: t("paymentCancelledMessage"),
            showOrderReference: false,
          })}
          onTryAgain={handleRetry}
          onSelectMethod={handleRetry}
        />
      );
    case "failed":
      return (
        <PaymentError
          details={mapPaymentFailureDetails({
            provider: "paypal",
            paymentId,
            status: t("declinedStatus"),
            reasonTitle: t("paymentDeclinedTitle"),
            reasonMessage: errorMessage || t("paymentDeclinedMessage"),
          })}
          onTryAgain={handleRetry}
          onSelectMethod={handleRetry}
        />
      );
    default:
      return (
        <PaymentReturnErrorCard
          ariaLabel={t("errorAria")}
          title={t("somethingWentWrongTitle")}
          description={errorMessage || t("somethingWentWrongMessage")}
          retryLabel={t("returnToCheckout")}
          dashboardLabel={t("goToDashboard")}
          onRetry={handleRetry}
        />
      );
  }
}
