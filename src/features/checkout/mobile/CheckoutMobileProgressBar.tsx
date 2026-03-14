"use client";

import { checkoutTheme } from "@/theme";

interface CheckoutMobileProgressBarProps {
  currentStep: number; // 1-based display (1 = first step)
  totalSteps: number;
}

export function CheckoutMobileProgressBar({
  currentStep,
  totalSteps,
}: CheckoutMobileProgressBarProps) {
  const m = checkoutTheme.mobile;
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={m.header.progressWrapper}>
      <div className={m.header.progressLabel}>
        <span>Checkout</span>
        <span>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className={m.header.progressBar}>
        <div
          className={m.header.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
