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
  "px-10 sm:px-28 py-6 sm:py-8 font-normal font-heading text-2xl sm:text-3xl tracking-widest shadow-2xl shadow-purple-500/50 hover:-translate-y-1.5 hover:shadow-3xl transition-all duration-300 w-full sm:w-auto";

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

  const scrollContainerToTop = () => {
    if (typeof window === "undefined") return;

    const container = document.getElementById("design-pipeline");
    if (!container) return;

    container.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  };

  const handleContinueClick = () => {
    if (!onContinue || isDisabled) return;

    onContinue();

    // Scroll now and once again after the next paint so step transitions
    // that change layout still end at the top of the wizard container.
    scrollContainerToTop();
    requestAnimationFrame(() => {
      scrollContainerToTop();
    });
  };

  return (
    <div className="sticky sm:static bottom-0 left-0 right-0 z-20 sm:z-auto px-4 sm:px-12 py-5 sm:py-10 bg-white/85 sm:bg-white/30 backdrop-blur-lg border-t border-white/20 rounded-t-3xl sm:rounded-none shadow-xl sm:shadow-none flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
      {/* Mobile: full-width CTA first (bottom), then cancel small; Desktop: cancel left, CTA right */}
      <Button
        id="wizard-continue-button"
        type="button"
        onClick={handleContinueClick}
        disabled={isDisabled}
        variant="default"
        size="lg"
        className={`${continueClassName || defaultContinueClassName} sm:order-last sm:ml-auto`}
      >
        {continueText}
        {continueIcon || <ArrowRight />}
      </Button>

      {showCancel ? (
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          size="lg"
          className="font-normal font-heading text-lg sm:text-xl tracking-widest sm:order-first"
        >
          {cancelText}
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {showBack && (
        <Button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          variant="ghost"
          size="lg"
          className="font-normal font-heading text-lg sm:text-xl tracking-widest"
        >
          Back
        </Button>
      )}
    </div>
  );
}
