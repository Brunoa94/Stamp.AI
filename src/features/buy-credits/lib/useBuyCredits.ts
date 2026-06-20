"use client";

import { useState } from "react";
import {
  CREDIT_PACKAGES,
  PRICE_PER_CREDIT,
  MIN_CUSTOM_CREDITS,
  DEFAULT_SELECTED_PACKAGE,
} from "@/constants/credits";

export type BuyCreditsStep = "select" | "payment";

export function useBuyCredits() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(
    DEFAULT_SELECTED_PACKAGE
  );
  const [customCredits, setCustomCreditsState] = useState("");
  const [step, setStep] = useState<BuyCreditsStep>("select");

  const isCustomSelected = selectedPackage === null;
  const customCreditsValue = parseInt(customCredits) || 0;

  const finalCredits = isCustomSelected
    ? customCreditsValue
    : (selectedPackage ?? 0);

  const finalPrice = isCustomSelected
    ? customCreditsValue * PRICE_PER_CREDIT
    : (CREDIT_PACKAGES.find((p) => p.credits === selectedPackage)?.price ?? 0);

  const canProceed = finalCredits >= MIN_CUSTOM_CREDITS && finalPrice > 0;

  const selectPackage = (credits: number) => {
    setSelectedPackage(credits);
    setCustomCreditsState("");
  };

  const selectCustom = () => {
    setSelectedPackage(null);
  };

  const setCustomCredits = (value: string) => {
    setCustomCreditsState(value.replace(/\D/g, ""));
  };

  const continueToPayment = () => {
    if (finalCredits >= MIN_CUSTOM_CREDITS) {
      setStep("payment");
    }
  };

  const goBack = () => setStep("select");

  const reset = () => {
    setStep("select");
    setSelectedPackage(DEFAULT_SELECTED_PACKAGE);
    setCustomCreditsState("");
  };

  return {
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
  };
}
