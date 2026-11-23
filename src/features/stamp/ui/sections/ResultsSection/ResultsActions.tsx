"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";

/**
 * ResultsActions
 *
 * Action buttons for using design or re-synthesizing.
 * On mobile, the primary action is shown in the sticky footer.
 */

interface PropsI {
  canProceed: boolean;
  onUseProtocol: () => void;
  onReSynthesize: () => void;
}

export function ResultsActions({
  canProceed,
  onUseProtocol,
  onReSynthesize,
}: PropsI) {
  const t = useTranslations("stamp.results");

  // Register primary action for mobile sticky footer (Step 4)
  useRegisterMobileAction(4, {
    action: onUseProtocol,
    label: t("useProtocol"),
    disabled: !canProceed,
  });

  return (
    <div className="pb-28 md:pb-0">
      {/* Desktop: show both buttons side by side */}
      <div className="hidden md:flex gap-4 md:gap-6">
        <Button
          variant="primary"
          onClick={onUseProtocol}
          disabled={!canProceed}
          className="flex-1 px-4 md:px-4 whitespace-normal"
        >
          {t("useProtocol")}
        </Button>
        <Button
          variant="secondary"
          onClick={onReSynthesize}
          className="flex-1 bg-(--color-stamp-white) px-4 md:px-4 whitespace-normal"
        >
          {t("reSynthesize")}
        </Button>
      </div>

      {/* Mobile: only show re-synthesize button (primary is in footer) */}
      <div className="md:hidden">
        <Button
          variant="secondary"
          onClick={onReSynthesize}
          className="w-full"
        >
          {t("reSynthesize")}
        </Button>
      </div>
    </div>
  );
}
