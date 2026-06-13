import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsI {
  stepNumber: number;
  isComplete: boolean;
  isActive: boolean;
  isProcessing: boolean;
}

/**
 * StepCircle - Individual step indicator circle
 * Displays step number, checkmark, or processing spinner
 */
export function StepCircle({
  stepNumber,
  isComplete,
  isActive,
  isProcessing,
}: PropsI) {
  return (
    <div
      className={cn(
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
        }
      )}
    >
      {isComplete ? (
        <Check
          className="w-7 h-7 md:w-8 md:h-8 animate-[checkout-checkmark_0.6s_ease-out]"
          strokeWidth={3}
        />
      ) : isProcessing ? (
        <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-[checkout-spinner_1s_linear_infinite]" />
      ) : (
        <span className="text-lg md:text-xl font-extrabold">{stepNumber}</span>
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
  );
}
