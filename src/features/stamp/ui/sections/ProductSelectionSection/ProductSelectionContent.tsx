"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import { StampStepTitle } from "../../components/StampStepTitle";
import { StampTitleAccent } from "../../components/StampTitleAccent";

/**
 * ProductSelectionContent
 *
 * Left panel with description and continue button.
 * On mobile, the button is shown in the sticky footer.
 */

interface PropsI {
  canProceed: boolean;
  onContinue: () => void;
}

export function ProductSelectionContent({ canProceed, onContinue }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  // Register action for mobile sticky footer (Step 5)
  useRegisterMobileAction(5, {
    action: onContinue,
    label: t("continue"),
    disabled: !canProceed,
  });

  return (
    <div className="md:h-full p-6 pt-4 md:pt-30 pb-6 md:p-16 lg:pt-16 xl:p-24 xl:pt-24 flex flex-col md:justify-between border-r border-(--color-stamp-divider)">
      <div>
        <StampStepTitle>
          {t.rich("title", {
            accent: (chunks) => <StampTitleAccent>{chunks}</StampTitleAccent>,
          })}
        </StampStepTitle>

        <Paragraph
          variant="card"
          className="text-(--color-stamp-taupe) mb-4 md:mb-12"
        >
          {t("description")}
        </Paragraph>
      </div>

      {/* Button - hidden on mobile, shown in sticky footer */}
      <div className="hidden md:block">
        <Button
          variant="primary"
          onClick={onContinue}
          disabled={!canProceed}
          className="w-full mt-2 md:mt-12 gap-3"
        >
          {t("continue")}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
