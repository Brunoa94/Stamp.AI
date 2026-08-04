"use client";

import { useCallback } from "react";
import { useStampNavigation } from "./useStampNavigation";
import {
  useStampGeneration,
  useStampSelectedImage,
  useStampUpload,
} from "./useStampSelectors";
import { logStampInfo, logStampWarn } from "../helpers/stampLogger";

/**
 * useSkipGeneration
 *
 * Hook for skipping AI generation when user has no coins.
 * Uses the uploaded image directly and proceeds to product selection.
 *
 * Flow:
 * 1. Takes the uploadedImageUrl as the selected design
 * 2. Adds a placeholder result to generatedResults
 * 3. Navigates directly to product selection (step 5)
 */
export function useSkipGeneration() {
  const { goToStep } = useStampNavigation();
  const { uploadedImageUrl } = useStampUpload();
  const { addGeneratedResult } = useStampGeneration();
  const { setSelectedImageUrl, setEnhancedPrompt } = useStampSelectedImage();

  const handleSkipGeneration = useCallback(() => {
    if (!uploadedImageUrl) {
      logStampWarn({
        scope: "useSkipGeneration",
        event: "skip_failed_no_uploaded_image",
      });
      return false;
    }

    logStampInfo({
      scope: "useSkipGeneration",
      event: "skipping_generation_using_uploaded_image",
      metadata: { uploadedImageUrl },
    });

    // Create a placeholder result using the uploaded image
    const placeholderResult = {
      imageUrl: uploadedImageUrl,
      enhancedPrompt: "Original uploaded image (no AI generation)",
      timestamp: Date.now(),
    };

    // Set the uploaded image as the selected design
    addGeneratedResult(placeholderResult);
    setSelectedImageUrl(uploadedImageUrl);
    setEnhancedPrompt(placeholderResult.enhancedPrompt);

    // Navigate directly to product selection (step 5)
    // Steps: 0=hero, 1=upload, 2=synthesis, 3=generation, 4=results, 5=product-selection
    goToStep(5);

    logStampInfo({
      scope: "useSkipGeneration",
      event: "skip_generation_completed",
    });

    return true;
  }, [
    uploadedImageUrl,
    addGeneratedResult,
    setSelectedImageUrl,
    setEnhancedPrompt,
    goToStep,
  ]);

  return {
    handleSkipGeneration,
    canSkip: !!uploadedImageUrl,
  };
}
