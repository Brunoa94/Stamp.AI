import { cn } from "@/lib/utils";

interface StepLabelProps {
  label: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

/**
 * StepLabel - Step text label and description
 * Displays the step name and optional description below the circle
 */
export function StepLabel({
  label,
  description,
  isActive,
  isComplete,
}: StepLabelProps) {
  return (
    <div className="mt-4 text-center">
      <p
        className={cn(
          "text-sm md:text-base font-bold transition-all duration-500",
          {
            "text-purple-700": isActive || isComplete,
            "text-gray-500": !isActive && !isComplete,
          }
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-xs mt-1 transition-all duration-500 hidden md:block",
          {
            "text-purple-600": isActive || isComplete,
            "text-gray-400": !isActive && !isComplete,
          }
        )}
      >
        {description}
      </p>
    </div>
  );
}
