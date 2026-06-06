import { ProgressBar } from "../components/ProgressBar";
import { ProgressStep } from "../components/ProgressStep";
import {
  calculateProgressWidth,
  isStepComplete,
  isStepActive,
} from "../../lib/helpers/checkoutProgressHelpers";

type PaymentStatus = "idle" | "success" | "error";

interface CheckoutProgressProps {
  shippingAddress: any;
  isProcessingPayment: boolean;
  paymentStatus: PaymentStatus;
}

interface Step {
  number: number;
  label: string;
  description: string;
}

const CHECKOUT_STEPS: Step[] = [
  { number: 1, label: "Shipping", description: "Enter delivery details" },
  { number: 2, label: "Payment", description: "Secure payment method" },
  { number: 3, label: "Complete", description: "Order confirmation" },
];

/**
 * CheckoutProgress - Enhanced progress stepper with smooth animations
 * Shows: Shipping → Payment → Complete
 * Decomposed into smaller atomic components for better maintainability
 */
export function CheckoutProgress({
  shippingAddress,
  isProcessingPayment,
  paymentStatus,
}: CheckoutProgressProps) {
  const hasShippingAddress = !!shippingAddress;
  const progressWidth = calculateProgressWidth(
    hasShippingAddress,
    isProcessingPayment,
    paymentStatus
  );

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Background Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-2 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full -z-10 mx-12 md:mx-16" />

          {/* Animated Progress Bar */}
          <ProgressBar progress={progressWidth} />

          {/* Steps */}
          {CHECKOUT_STEPS.map((step, index) => {
            const stepComplete = isStepComplete(
              step.number,
              hasShippingAddress,
              paymentStatus
            );
            const stepActive = isStepActive(
              step.number,
              hasShippingAddress,
              paymentStatus
            );
            const stepProcessing = step.number === 2 && isProcessingPayment;

            return (
              <ProgressStep
                key={step.number}
                step={step}
                isComplete={stepComplete}
                isActive={stepActive}
                isProcessing={stepProcessing}
                showConnector={index < CHECKOUT_STEPS.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
