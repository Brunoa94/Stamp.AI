"use client";

import { useTranslations } from "next-intl";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";
import { useStampSelectedImage } from "../../../lib/hooks/useStampSelectors";
import { ResultsImage } from "./ResultsImage";
import { ResultsActions } from "./ResultsActions";
import { Heading } from "@/features/ui/heading";

/**
 * ResultsSection
 *
 * Step 4: Display generated results
 * Protocol 04 / Output
 */

export function ResultsSection() {
  const t = useTranslations("stamp.results");
  const { nextStep, goToStep } = useStampNavigation();
  const { selectedImageUrl, enhancedPrompt } = useStampSelectedImage();
  const canProceedToProduct = Boolean(selectedImageUrl);

  const handleUseProtocol = () => {
    nextStep();
  };

  const handleReSynthesize = () => {
    goToStep(2);
  };

  const displayImageUrl =
    selectedImageUrl ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop";

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      id="step-4"
      className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-(--color-stamp-off-white) border-b border-(--color-stamp-divider)"
    >
      <div className="max-w-2xl w-full">
        <Heading
          as="h2"
          variant="title"
          className="text-(--color-stamp-chocolate) mb-6"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
                {chunks}
              </span>
            ),
          })}
        </Heading>
        <ResultsImage imageUrl={displayImageUrl} />
        <ResultsActions
          canProceed={canProceedToProduct}
          onUseProtocol={handleUseProtocol}
          onReSynthesize={handleReSynthesize}
        />
      </div>
    </section>
  );
}
