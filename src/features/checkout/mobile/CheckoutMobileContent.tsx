"use client";

import { useRouter } from "next/navigation";
import { checkoutTheme } from "@/theme";
import { useMultiStepWizard } from "@/hooks/useMultiStepWizard";
import { CheckoutMobileProgressBar } from "./CheckoutMobileProgressBar";
import { CheckoutMobileSummaryAccordion } from "./CheckoutMobileSummaryAccordion";
import { CheckoutAccordionStep } from "./CheckoutAccordionStep";
import { CheckoutMobileShippingStep } from "./CheckoutMobileShippingStep";
import { CheckoutMobileShippingMethodStep } from "./CheckoutMobileShippingMethodStep";
import { CheckoutMobileBillingStep } from "./CheckoutMobileBillingStep";
import { CheckoutMobilePaymentStep } from "./CheckoutMobilePaymentStep";
import { CheckoutMobileFooter } from "./CheckoutMobileFooter";
import { STEPS, TOTAL_STEPS } from "./const/mobile-steps";

export function CheckoutMobileContent() {
  const router = useRouter();
  const m = checkoutTheme.mobile;

  const {
    progressStep,
    completeStep,
    getStepState,
    isStepOpen,
    handleStepToggle,
  } = useMultiStepWizard({ totalSteps: TOTAL_STEPS });

  return (
    <div className={m.layout}>
      {/* Sticky progress header */}
      <CheckoutMobileProgressBar
        currentStep={progressStep}
        totalSteps={TOTAL_STEPS}
        onBack={() => router.back()}
      />

      {/* Scrollable body */}
      <div className={m.body}>
        {/* Collapsible order summary */}
        <CheckoutMobileSummaryAccordion />

        {/* Step 1 – Shipping Address */}
        <CheckoutAccordionStep
          stepNumber={STEPS[0].stepNumber}
          title={STEPS[0].title}
          state={getStepState(0)}
          isOpen={isStepOpen(0)}
          onToggle={() => handleStepToggle(0)}
        >
          <CheckoutMobileShippingStep onComplete={() => completeStep(0)} />
        </CheckoutAccordionStep>

        {/* Step 2 – Shipping Method */}
        <CheckoutAccordionStep
          stepNumber={STEPS[1].stepNumber}
          title={STEPS[1].title}
          state={getStepState(1)}
          isOpen={isStepOpen(1)}
          onToggle={() => handleStepToggle(1)}
        >
          <CheckoutMobileShippingMethodStep
            onComplete={() => completeStep(1)}
          />
        </CheckoutAccordionStep>

        {/* Step 3 – Billing Info */}
        <CheckoutAccordionStep
          stepNumber={STEPS[2].stepNumber}
          title={STEPS[2].title}
          state={getStepState(2)}
          isOpen={isStepOpen(2)}
          onToggle={() => handleStepToggle(2)}
        >
          <CheckoutMobileBillingStep onComplete={() => completeStep(2)} />
        </CheckoutAccordionStep>

        {/* Step 4 – Payment Method */}
        <CheckoutAccordionStep
          stepNumber={STEPS[3].stepNumber}
          title={STEPS[3].title}
          state={getStepState(3)}
          isOpen={isStepOpen(3)}
          onToggle={() => handleStepToggle(3)}
        >
          <CheckoutMobilePaymentStep />
        </CheckoutAccordionStep>
      </div>

      {/* Sticky footer CTA */}
      <CheckoutMobileFooter />
    </div>
  );
}
