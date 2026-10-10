"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PaymentError from "../../components/PaymentError";
import { PaymentReturnErrorCard } from "../../components/PaymentReturn/PaymentReturnErrorCard";
import { PaymentReturnPendingCard } from "../../components/PaymentReturn/PaymentReturnPendingCard";
import { PaymentReturnProcessingCard } from "../../components/PaymentReturn/PaymentReturnProcessingCard";
import PaymentSuccess from "../../PaymentSuccess/PaymentSuccess";
import { PAYMENT_RETURN_ROUTES } from "@/features/checkout/lib/constants/paymentReturn";
import { getMollieFailureCopyKeys } from "@/features/checkout/lib/helpers/getMollieFailureCopyKeys";
import { getMollieRetryRoute } from "@/features/checkout/lib/helpers/getMollieRetryRoute";
import { useMollieReturn } from "@/features/checkout/lib/hooks/useMollieReturn";
import {
  mapPaymentFailureDetails,
  mapPaymentSuccessDetails,
} from "@/features/checkout/lib/mappers/paymentReturnDetailsMapper";

export function MollieReturnSection() {
  const t = useTranslations("checkout.returns.mollie");
  const router = useRouter();
  const {
    status,
    paymentId,
    providerStatus,
    cartId,
    orderNumber,
    errorMessage,
  } = useMollieReturn();

  const handleRetry = () => router.push(getMollieRetryRoute(cartId));
  const handleCreateAnother = () =>
    router.push(PAYMENT_RETURN_ROUTES.createAnother);

  switch (status) {
    case "loading":
    case "processing":
      return (
        <PaymentReturnProcessingCard
          ariaLabel={t("verifyingAria")}
          title={t("verifyingTitle")}
          description={t("verifyingMessage")}
        />
      );
    case "success":
      return (
        <PaymentSuccess
          details={mapPaymentSuccessDetails({
            provider: "mollie",
            id: paymentId,
            paymentId,
            orderNumber,
            status: providerStatus ?? "paid",
            totalPaid: t("totalPaid"),
            estimatedDelivery: t("estimatedDelivery"),
          })}
          onCreateAnother={handleCreateAnother}
        />
      );
    case "failed": {
      const { statusKey, reasonKey } = getMollieFailureCopyKeys(providerStatus);
      return (
        <PaymentError
          details={mapPaymentFailureDetails({
            provider: "mollie",
            paymentId,
            status: t(statusKey),
            reasonTitle: t("paymentStatusTitle"),
            reasonMessage: t(reasonKey),
          })}
          onTryAgain={handleRetry}
          onSelectMethod={handleRetry}
        />
      );
    }
    case "pending":
      return (
        <PaymentReturnPendingCard
          ariaLabel={t("pendingAria")}
          title={t("pendingTitle")}
          description={t("pendingMessage")}
          viewOrdersLabel={t("viewOrders")}
          dashboardLabel={t("goToDashboard")}
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
