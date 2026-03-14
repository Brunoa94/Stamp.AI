"use client";

import { ArrowLeft } from "lucide-react";
import { checkoutTheme } from "@/theme";
import { Button } from "@/features/ui/button";

interface CheckoutMobileProgressBarProps {
  currentStep: number; // 1-based display (1 = first step)
  totalSteps: number;
  onBack?: () => void;
}

export function CheckoutMobileProgressBar({
  currentStep,
  totalSteps,
  onBack,
}: CheckoutMobileProgressBarProps) {
  const m = checkoutTheme.mobile;
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={m.header.wrapper}>
      <div className={m.header.inner}>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onBack}
          className={m.header.backButton}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </Button>

        <span className={m.header.logo}>Checkout</span>

        {/* Spacer to keep logo centred */}
        <div className="w-10" aria-hidden="true" />
      </div>

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
    </div>
  );
}
