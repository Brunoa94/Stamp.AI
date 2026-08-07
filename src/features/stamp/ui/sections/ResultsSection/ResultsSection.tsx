"use client";

import { memo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useStampNavigationActions } from "../../../lib/hooks/useStampNavigation";
import {
  useStampSelectedImage,
  useStampGeneration,
} from "../../../lib/hooks/useStampSelectors";
import { useLoadCachedImages } from "../../../lib/hooks/useLoadCachedImages";
import { ResultsImage } from "./ResultsImage";
import { ResultsActions } from "./ResultsActions";
import { ResultsGallery } from "./ResultsGallery";
import { Heading } from "@/features/ui/heading";

/**
 * ResultsSection
 *
 * Step 4: Display generated results
 * Protocol 04 / Output
 *
 * Shows the currently selected image and a gallery of previously
 * generated images (cached in localStorage with 24h TTL).
 */

function ResultsSectionComponent() {
  const t = useTranslations("stamp.results");
  const { nextStep, goToStep } = useStampNavigationActions();
  const { selectedImageUrl, setSelectedImageUrl, setEnhancedPrompt } =
    useStampSelectedImage();
  const { generatedResults } = useStampGeneration();
  const canProceedToProduct = Boolean(selectedImageUrl);

  // Load cached images from localStorage on mount
  useLoadCachedImages();

  // Auto-select first image if none selected and we have results
  useEffect(() => {
    if (!selectedImageUrl && generatedResults.length > 0) {
      const firstResult = generatedResults[0];
      setSelectedImageUrl(firstResult.imageUrl);
      setEnhancedPrompt(firstResult.enhancedPrompt);
    }
  }, [
    selectedImageUrl,
    generatedResults,
    setSelectedImageUrl,
    setEnhancedPrompt,
  ]);

  const handleUseProtocol = () => {
    nextStep();
  };

  const handleReSynthesize = () => {
    goToStep(2);
  };

  const handleSelectImage = (imageUrl: string, enhancedPrompt: string) => {
    setSelectedImageUrl(imageUrl);
    setEnhancedPrompt(enhancedPrompt);
  };

  const displayImageUrl =
    selectedImageUrl ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop";

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
        <ResultsGallery
          results={generatedResults}
          selectedImageUrl={selectedImageUrl}
          onSelectImage={handleSelectImage}
        />
        <ResultsActions
          canProceed={canProceedToProduct}
          onUseProtocol={handleUseProtocol}
          onReSynthesize={handleReSynthesize}
        />
      </div>
    </section>
  );
}

export const ResultsSection = memo(ResultsSectionComponent);
