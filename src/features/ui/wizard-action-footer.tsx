import { ArrowRight } from "lucide-react";
import { Button } from "./button";

interface WizardActionFooterProps {
  onCancel?: () => void;
  onBack?: () => void;
  onContinue?: () => void;
  continueText?: string;
  continueIcon?: React.ReactNode;
  canContinue?: boolean;
  showBack?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  continueClassName?: string;
}

const defaultContinueClassName =
  "px-20 py-6 font-normal font-heading text-2xl tracking-widest shadow-2xl shadow-purple-500/50 hover:-translate-y-1.5 hover:shadow-3xl transition-all duration-300";

export function WizardActionFooter({
  onCancel,
  onBack,
  onContinue,
  continueText = "Continue",
  continueIcon,
  canContinue = true,
  showBack = true,
  showCancel = true,
  cancelText = "Cancel",
  continueClassName,
}: WizardActionFooterProps) {
  const isDisabled = !canContinue || !onContinue;

  return (
    <div className="px-12 py-10 bg-white/30 backdrop-blur-lg border-t border-white/20 flex justify-between items-center">
      {showCancel ? (
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          size="lg"
          className="font-normal font-heading text-xl tracking-widest"
        >
          {cancelText}
        </Button>
      ) : (
        <div />
      )}

      <div className="flex gap-6">
        {showBack && (
          <Button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            variant="ghost"
            size="lg"
            className="font-normal font-heading text-xl tracking-widest"
          >
            Back
          </Button>
        )}

        <Button
          type="button"
          onClick={onContinue}
          disabled={isDisabled}
          variant="default"
          size="lg"
          className={continueClassName || defaultContinueClassName}
        >
          {continueText}
          {continueIcon || <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}
