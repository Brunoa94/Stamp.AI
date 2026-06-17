"use client";

import { useCallback } from "react";
import { Modal } from "@/features/ui/modal/Modal";
import { useBuyCredits } from "../lib/useBuyCredits";
import { CreditSelectionStep } from "./selection/CreditSelectionStep";
import { CreditPaymentStep } from "./payment/CreditPaymentStep";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface BuyCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (credits: number) => void;
}

export function BuyCreditsDialog({
  isOpen,
  onClose,
  onSuccess,
}: BuyCreditsDialogProps) {
  const { handleError } = useErrorHandler();

  const {
    selectedPackage,
    customCredits,
    step,
    isCustomSelected,
    finalCredits,
    finalPrice,
    canProceed,
    selectPackage,
    selectCustom,
    setCustomCredits,
    continueToPayment,
    goBack,
    reset,
  } = useBuyCredits();

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handlePaymentSuccess = useCallback(() => {
    onSuccess?.(finalCredits);
    handleClose();
  }, [finalCredits, onSuccess, handleClose]);

  const handlePaymentError = useCallback(
    (error: string) => {
      handleError(new Error(error));
    },
    [handleError],
  );

  const title = step === "select" ? "Buy Credits" : "Complete Payment";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description="Purchase credits to create more AI-powered designs"
      className="sm:max-w-xl max-h-[90vh] overflow-y-auto"
    >
      <div>
        {step === "select" ? (
          <CreditSelectionStep
            selectedPackage={selectedPackage}
            customCredits={customCredits}
            isCustomSelected={isCustomSelected}
            finalCredits={finalCredits}
            finalPrice={finalPrice}
            canProceed={canProceed}
            onSelectPackage={selectPackage}
            onSelectCustom={selectCustom}
            onCustomCreditsChange={setCustomCredits}
            onContinue={continueToPayment}
          />
        ) : (
          <CreditPaymentStep
            credits={finalCredits}
            price={finalPrice}
            onBack={goBack}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </div>
    </Modal>
  );
}
