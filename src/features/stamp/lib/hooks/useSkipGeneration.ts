"use client";

import { useCallback, useMemo } from "react";
import { useStampNavigation } from "./useStampNavigation";
import {
  useStampGeneration,
  useStampSelectedImage,
  useStampUpload,
} from "./useStampSelectors";
import { logStampInfo, logStampWarn } from "../helpers/stampLogger";
import { getStoredImages } from "../services/generatedImagesStorage";

/**
 * useSkipGeneration
 *
 * Hook for skipping AI generation when user has no coins.
 * Allows two skip scenarios:
 * 1. Use the uploaded image directly
 * 2. Use previously cached images from localStorage (24h TTL)
 *
 * Flow:
 * - If cached images exist: Load them and go to results (step 4)
 * - If only uploaded image: Use it as selected design and go to product selection (step 5)
 */
export function useSkipGeneration() {
  const { goToStep } = useStampNavigation();
  const { uploadedImageUrl } = useStampUpload();
  const { addGeneratedResult, setGeneratedResults } = useStampGeneration();
  const { setSelectedImageUrl, setEnhancedPrompt } = useStampSelectedImage();

  // Check for cached images
  const cachedImages = useMemo(() => getStoredImages(), []);
  const hasCachedImages = cachedImages.length > 0;

  const handleSkipGeneration = useCallback(() => {
    // Priority 1: Use cached images if available
    if (hasCachedImages) {
      logStampInfo({
        scope: "useSkipGeneration",
        event: "skipping_generation_using_cached_images",
        metadata: { cachedCount: cachedImages.length },
      });

      // Load cached images into state
      setGeneratedResults(cachedImages);

      // Auto-select the most recent (first) cached image
      const firstResult = cachedImages[0];
      setSelectedImageUrl(firstResult.imageUrl);
      setEnhancedPrompt(firstResult.enhancedPrompt);

      // Navigate to results section (step 4) to show cached images
      // Steps: 0=hero, 1=upload, 2=synthesis, 3=generation, 4=results, 5=product-selection
      goToStep(4);

      logStampInfo({
        scope: "useSkipGeneration",
        event: "skip_to_cached_images_completed",
      });

      return true;
    }

    // Priority 2: Use uploaded image if no cached images
    if (!uploadedImageUrl) {
      logStampWarn({
        scope: "useSkipGeneration",
        event: "skip_failed_no_images_available",
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
    goToStep(5);

    logStampInfo({
      scope: "useSkipGeneration",
      event: "skip_generation_completed",
    });

    return true;
  }, [
    hasCachedImages,
    cachedImages,
    uploadedImageUrl,
    addGeneratedResult,
    setGeneratedResults,
    setSelectedImageUrl,
    setEnhancedPrompt,
    goToStep,
  ]);

  return {
    handleSkipGeneration,
    canSkip: hasCachedImages || !!uploadedImageUrl,
    hasCachedImages,
  };
}
