"use client";

import { useCallback, useEffect, useState } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import {
  useStampGeneration,
  useStampSelectedImage,
  useStampUpload,
} from "./useStampSelectors";
import { logStampInfo, logStampWarn } from "../helpers/stampLogger";
import { getStoredImages } from "../services/generatedImagesStorage";
import type { GeneratedResultType } from "../types/stampFlowTypes";

/**
 * useSkipGeneration
 *
 * Hook for skipping AI generation when user has no coins.
 * Allows two skip scenarios with priority:
 *
 * Priority 1 (highest): Use the uploaded image directly → step 5 (product selection)
 * Priority 2: Use previously cached images from localStorage (24h TTL) → step 4 (results)
 *
 * This priority ensures users can always proceed with their freshly uploaded image,
 * even if they have previously generated images cached.
 */
export function useSkipGeneration() {
  const { uploadedImageUrl } = useStampUpload();
  const { addGeneratedResult, setGeneratedResults } = useStampGeneration();
  const { setSelectedImageUrl, setEnhancedPrompt } = useStampSelectedImage();

  // Use setCurrentStep directly to bypass accessibility checks when skipping
  // This is intentional - skip is a special case where we populate data AND navigate
  const setCurrentStep = useStampFlowStore((state) => state.setCurrentStep);

  // Check for cached images - initialize with stored images to avoid flash
  const [cachedImages, setCachedImages] = useState<GeneratedResultType[]>(() => {
    // Initialize with stored images (runs once on mount, client-side only)
    if (typeof window === "undefined") return [];
    return getStoredImages();
  });

  // Re-check for cached images periodically in case they were added elsewhere
  useEffect(() => {
    const images = getStoredImages();
    if (images.length !== cachedImages.length) {
      setCachedImages(images);
    }
  }, [cachedImages.length]);

  const hasCachedImages = cachedImages.length > 0;

  const handleSkipGeneration = useCallback(() => {
    // Priority 1 (HIGHEST): Use uploaded image if available
    // This takes priority because the user just uploaded this image and wants to use it
    if (uploadedImageUrl) {
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
      // Use setCurrentStep directly to bypass accessibility checks (we just set the data)
      setCurrentStep(5);

      logStampInfo({
        scope: "useSkipGeneration",
        event: "skip_generation_completed",
      });

      return true;
    }

    // Priority 2: Use cached images if no uploaded image
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
      // Use setCurrentStep directly to bypass accessibility checks (we just set the data)
      setCurrentStep(4);

      logStampInfo({
        scope: "useSkipGeneration",
        event: "skip_to_cached_images_completed",
      });

      return true;
    }

    // Priority 3: No images available - go back to upload
    logStampWarn({
      scope: "useSkipGeneration",
      event: "skip_failed_no_images_available",
    });
    setCurrentStep(1);
    return false;
  }, [
    uploadedImageUrl,
    hasCachedImages,
    cachedImages,
    addGeneratedResult,
    setGeneratedResults,
    setSelectedImageUrl,
    setEnhancedPrompt,
    setCurrentStep,
  ]);

  // Allow skip if we have cached images OR an uploaded image
  // Always allow skip with uploaded image since user is on synthesis step
  const canSkip = hasCachedImages || !!uploadedImageUrl;

  return {
    handleSkipGeneration,
    canSkip,
    hasCachedImages,
    // Expose for debugging
    hasUploadedImage: !!uploadedImageUrl,
  };
}
