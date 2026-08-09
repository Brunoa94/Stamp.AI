"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";

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
    <div className="md:h-full p-6 pt-4 md:pt-30 pb-6 md:p-10 lg:p-16 lg:pt-16 xl:p-24 xl:pt-24 flex flex-col md:justify-between border-r border-(--color-stamp-divider)">
      <div>
        <Heading
          as="h2"
          variant="panelTitle"
          className="text-(--color-stamp-chocolate) mb-4 md:mb-6"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
                {chunks}
              </span>
            ),
          })}
        </Heading>

        <Paragraph
          variant="card"
          className="text-(--color-stamp-taupe) mb-4 md:mb-12 max-w-sm line-clamp-2 md:line-clamp-none"
        >
          {t("description")}
        </Paragraph>
      </div>

      {/* Button - hidden on mobile, shown in sticky footer */}
      <div className="hidden md:block">
        <Button
          onClick={onContinue}
          disabled={!canProceed}
          className="w-full mt-2 md:mt-12 bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("continue")}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
