import clsx from "clsx";

type PaymentStatus = "idle" | "success" | "error";

interface Props {
  shippingAddress: any;
  isProcessingPayment: boolean;
  paymentStatus: PaymentStatus;
}

interface Step {
  number: number;
  label: string;
  description: string;
}

const steps: Step[] = [
  { number: 1, label: "Shipping", description: "Enter delivery details" },
  { number: 2, label: "Payment", description: "Secure payment method" },
  { number: 3, label: "Complete", description: "Order confirmation" },
];

/**
 * Enhanced progress stepper with smooth animations
 * Shows: Shipping → Payment → Complete
 */
export const CheckoutProgress = ({
  shippingAddress,
  isProcessingPayment,
  paymentStatus,
}: Props) => {
  const getProgressWidth = () => {
    if (paymentStatus === "success") return "100%";
    if (shippingAddress && !isProcessingPayment) return "50%";
    if (shippingAddress) return "25%";
    return "0%";
  };

  const isStepComplete = (stepNumber: number) => {
    if (stepNumber === 1) return !!shippingAddress;
    if (stepNumber === 2) return paymentStatus === "success";
    if (stepNumber === 3) return paymentStatus === "success";
    return false;
  };

  const isStepActive = (stepNumber: number) => {
    if (stepNumber === 1) return !shippingAddress;
    if (stepNumber === 2)
      return !!shippingAddress && paymentStatus !== "success";
    if (stepNumber === 3) return paymentStatus === "success";
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Steps container */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Background Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full -z-10 mx-12 md:mx-16" />

          {/* Animated Progress Line with glow */}
          <div className="absolute top-8 left-0 right-0 h-2 -z-10 mx-12 md:mx-16">
            <div
              className="h-full bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ease-in-out"
              style={{ width: getProgressWidth() }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[checkout-shimmer_2s_infinite]" />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-gray-400 blur-sm opacity-60" />
            </div>
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const isComplete = isStepComplete(step.number);
            const isActive = isStepActive(step.number);
            const isProcessing = step.number === 2 && isProcessingPayment;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center relative px-2 md:px-4 z-10 flex-1"
              >
                {/* Step circle */}
                <div
                  className={clsx(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold transition-all duration-700 border-4 relative",
                    "transform hover:scale-110 cursor-pointer",
                    {
                      // Completed state
                      "bg-linear-to-br from-slate-600 via-gray-600 to-slate-700 text-white border-slate-400 shadow-2xl shadow-slate-400/50 scale-110 animate-[checkout-step-complete_0.6s_ease-out]":
                        isComplete,
                      // Active state
                      "bg-transparent text-purple-700 border-purple-400 border-4 shadow-xl shadow-purple-300/50 scale-105 animate-[checkout-step-active_2s_ease-in-out_infinite]":
                        isActive && !isComplete,
                      // Inactive state
                      "bg-transparent text-gray-400 border-gray-300 shadow-md":
                        !isActive && !isComplete,
                    },
                  )}
                >
                  {isComplete ? (
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 animate-[checkout-checkmark_0.6s_ease-out]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isProcessing ? (
                    <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-[checkout-spinner_1s_linear_infinite]" />
                  ) : (
                    <span className="text-lg md:text-xl font-extrabold">
                      {step.number}
                    </span>
                  )}

                  {/* Pulse ring for active step */}
                  {isActive && !isComplete && (
                    <span className="absolute inset-0 rounded-full border-4 border-purple-400 animate-[checkout-pulse-ring_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  )}

                  {/* Glow effect for completed steps */}
                  {isComplete && (
                    <span className="absolute inset-0 rounded-full bg-purple-400 blur-lg opacity-40" />
                  )}
                </div>

                {/* Step label */}
                <div className="mt-4 text-center">
                  <p
                    className={clsx(
                      "text-sm md:text-base font-bold transition-all duration-500",
                      {
                        "text-purple-700": isActive || isComplete,
                        "text-gray-500": !isActive && !isComplete,
                      },
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={clsx(
                      "text-xs mt-1 transition-all duration-500 hidden md:block",
                      {
                        "text-purple-600": isActive || isComplete,
                        "text-gray-400": !isActive && !isComplete,
                      },
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Connector line for mobile */}
                {index < steps.length - 1 && (
                  <div className="absolute top-7 md:top-8 left-full w-full h-0.5 bg-gray-200 -z-20 md:hidden" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
