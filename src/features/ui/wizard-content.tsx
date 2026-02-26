import { ReactNode } from "react";
import clsx from "clsx";

interface WizardContentProps {
  children: ReactNode;
  description?: string;
  showActions?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  className?: string;
}

export function WizardContent({
  children,
  description,
  showActions = true,
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  isNextDisabled = false,
  className,
}: WizardContentProps) {
  return (
    <>
      {/* Active Step Content */}
      <div className={clsx("flex-1 p-10 flex flex-col", className)}>
        {description && (
          <p className="text-slate-600 mb-8 max-w-2xl text-lg">
            {description}
          </p>
        )}

        {children}
      </div>

      {/* Step Footer Actions */}
      {showActions && (
        <div className="px-10 py-6 flex justify-end gap-4 border-t border-slate-100">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {backLabel}
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled}
              className={clsx(
                "px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2",
                {
                  "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40":
                    !isNextDisabled,
                  "bg-slate-200 text-slate-400 cursor-not-allowed":
                    isNextDisabled,
                }
              )}
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}
