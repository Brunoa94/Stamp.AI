"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { usePaymentRecovery } from "@/shared/queries/paymentRecoveryQueries";
import type { PaymentRecoveryRecordT } from "@/shared/types/paymentRecovery";

interface PaymentRecoveryBannerProps {
  onRecoveryComplete?: (orderId: string) => void;
}

export function PaymentRecoveryBanner({
  onRecoveryComplete,
}: PaymentRecoveryBannerProps) {
  const t = useTranslations("checkout.recoveryBanner");
  const {
    pendingRecoveries,
    hasPendingRecoveries,
    isProcessing,
    isDismissing,
    processingId,
    dismissedIds,
    recover,
    dismiss,
  } = usePaymentRecovery();

  if (!hasPendingRecoveries) {
    return null;
  }

  const visibleRecoveries = pendingRecoveries.filter(
    (r) => !dismissedIds.has(r.id),
  );

  if (visibleRecoveries.length === 0) {
    return null;
  }

  const handleRecover = async (recovery: PaymentRecoveryRecordT) => {
    try {
      const result = await recover(recovery);

      if (result.success && result.orderId) {
        console.log("✅ Order recovered:", result.orderId);
        onRecoveryComplete?.(result.orderId);
      } else {
        alert(t("recoverFailed", { error: result.error || t("unknownError") }));
      }
    } catch (error) {
      console.error("Recovery error:", error);
      alert(t("recoverFailedContactSupport"));
    }
  };

  const handleDismiss = async (recoveryId: string) => {
    try {
      await dismiss(recoveryId);
    } catch (error) {
      console.error("Dismiss error:", error);
    }
  };

  return (
    <div className="space-y-3">
      {visibleRecoveries.map((recovery) => {
        const isThisProcessing = processingId === recovery.id;
        const providerName =
          recovery.payment_provider.charAt(0).toUpperCase() +
          recovery.payment_provider.slice(1);
        return (
          <div
            key={recovery.id}
            className="rounded-xl border border-(--color-stamp-gold)/40 bg-(--color-stamp-peach) p-4 shadow-(--shadow-stamp-card) md:p-5"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-(--color-stamp-gold-text)" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0">
                <Heading
                  as="h2"
                  variant="itemCompact"
                  className="mb-1 text-(--color-stamp-chocolate)"
                >
                  {t("title")}
                </Heading>

                <Paragraph variant="xs" className="mb-4 text-(--color-stamp-chocolate)">
                  {t.rich("body", {
                    providerName,
                    currency: recovery.currency,
                    amountValue: recovery.amount.toFixed(2),
                    amount: (chunks) => <strong>{chunks}</strong>,
                  })}
                </Paragraph>

                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="primary-compact"
                    onClick={() => handleRecover(recovery)}
                    disabled={isProcessing || isDismissing}
                  >
                    {isThisProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("completing")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("complete")}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary-compact"
                    onClick={() => handleDismiss(recovery.id)}
                    disabled={isProcessing || isDismissing}
                  >
                    <XCircle className="w-4 h-4" />
                    {t("dismiss")}
                  </Button>
                </div>

                <Span as="p" variant="micro" className="mt-3 text-(--color-stamp-taupe)">
                  {t("paymentIdLine", {
                    id: recovery.payment_intent_id.slice(-8),
                    date: new Date(recovery.created_at).toLocaleString(),
                  })}
                </Span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
