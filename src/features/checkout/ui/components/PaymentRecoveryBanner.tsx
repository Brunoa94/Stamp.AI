"use client";

import React from "react";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { usePaymentRecovery } from "@/queries/paymentRecoveryQueries";
import type { PaymentRecoveryRecordI } from "@/services/paymentRecoveryService";

interface PaymentRecoveryBannerProps {
  onRecoveryComplete?: (orderId: string) => void;
}

export function PaymentRecoveryBanner({
  onRecoveryComplete,
}: PaymentRecoveryBannerProps) {
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

  const handleRecover = async (recovery: PaymentRecoveryRecordI) => {
    try {
      const result = await recover(recovery);

      if (result.success && result.orderId) {
        console.log("✅ Order recovered:", result.orderId);
        onRecoveryComplete?.(result.orderId);
      } else {
        alert(`Failed to recover payment: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Recovery error:", error);
      alert("Failed to recover payment. Please contact support.");
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
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Incomplete Order Found
                </h3>

                <p className="text-sm text-amber-800 mb-3">
                  We found a successful {providerName} payment for{" "}
                  <strong>
                    {recovery.currency} {recovery.amount.toFixed(2)}
                  </strong>{" "}
                  that wasn't completed. Would you like to finalize this order
                  now?
                </p>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleRecover(recovery)}
                    disabled={isProcessing || isDismissing}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isThisProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Completing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Complete Order
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(recovery.id)}
                    disabled={isProcessing || isDismissing}
                    className="border-amber-300 text-amber-900 hover:bg-amber-100"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Dismiss
                  </Button>
                </div>

                <p className="text-lg text-amber-700 mt-2">
                  Payment ID: {recovery.payment_intent_id.slice(-8)}
                  {" • "}
                  {new Date(recovery.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
