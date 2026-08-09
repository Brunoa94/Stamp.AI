"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useStampNavigation } from "./useStampNavigation";
import {
  useStampGeneration,
  useStampSelectedImage,
  useStampUpload,
} from "./useStampSelectors";
import { useImageGeneration as useImageGenerationMutation } from "@/queries/imageGenerationQueries";
import { useDeductCoin } from "@/queries/coinsQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logStampError, logStampWarn, logStampInfo } from "../helpers/stampLogger";
import { withTimeout } from "@/lib/promiseUtils";
import { AnalyticsService } from "@/services/analyticsService";
import { addStoredImage } from "../services/generatedImagesStorage";
import {
  DEFAULT_SYNTHESIS_STYLE,
  IMAGE_GENERATION_TIMEOUT_MS,
} from "../constants/imageGeneration";
import {
  ImageGenerationTimeoutError,
  resolveReferenceImageFile,
  startSimulatedProgress,
} from "../helpers/imageGenerationHelpers";

/**
 * useStampImageGeneration
 *
 * Hook for handling AI image generation in Stamp. Orchestrates the flow;
 * file conversion, timeout error and progress simulation live in
 * ../helpers/imageGenerationHelpers, config in ../constants/imageGeneration.
 *
 * Error Handling Pattern:
 * - Implements idempotency checks to prevent duplicate generation requests
 * - Uses timeout handling for long-running AI operations
 * - Provides clear user-facing error messages with recovery paths
 *
 * Coins Integration:
 * - Deducts 1 coin before image generation
 * - Aborts generation if coin deduction fails
 */

interface GenerateImageParamsType {
  prompt: string;
  preservation: number;
  removeBackground: boolean;
}

export function useStampImageGeneration() {
  const t = useTranslations("stamp.errors.imageGeneration");
  const tCoins = useTranslations("stamp.errors.coins");
  const { nextStep } = useStampNavigation();
  const { handleError } = useErrorHandler();
  const { uploadedImageUrl } = useStampUpload();
  const {
    setIsGenerating,
    addGeneratedResult,
    setGenerationProgress,
  } = useStampGeneration();
  const { setSelectedImageUrl, setEnhancedPrompt } = useStampSelectedImage();

  const generateMutation = useImageGenerationMutation();
  const deductCoinMutation = useDeductCoin();

  // Idempotency: Track if generation is in progress to prevent duplicates
  const isGeneratingRef = useRef(false);

  const handleGenerate = async ({
    prompt,
    preservation,
    removeBackground,
  }: GenerateImageParamsType) => {
    // Idempotency check: Prevent duplicate generation requests
    if (isGeneratingRef.current) {
      logStampWarn({
        scope: "useStampImageGeneration",
        event: "duplicate_generate_request_ignored",
      });
      return;
    }

    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      handleError(new Error(t("emptyPrompt")));
      return;
    }

    // Set idempotency lock
    isGeneratingRef.current = true;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Navigate to generation loading screen (Step 3)
    nextStep();

    // Simulate progress for better UX
    const stopProgress = startSimulatedProgress(setGenerationProgress);

    try {
      const imageFile = await resolveReferenceImageFile(uploadedImageUrl);

      // Deduct coin before generation
      logStampInfo({
        scope: "useStampImageGeneration",
        event: "deducting_coin_before_generation",
      });

      const coinDeducted = await deductCoinMutation.mutateAsync();

      if (!coinDeducted) {
        logStampWarn({
          scope: "useStampImageGeneration",
          event: "coin_deduction_failed_no_coins",
        });
        stopProgress();
        setGenerationProgress(0);
        handleError(new Error(tCoins("deductFailed")));
        return;
      }

      logStampInfo({
        scope: "useStampImageGeneration",
        event: "coin_deducted_successfully",
      });

      // Wrap mutation with timeout
      const result = await withTimeout(
        generateMutation.mutateAsync({
          image: imageFile,
          prompt,
          selectedStyle: DEFAULT_SYNTHESIS_STYLE,
          preservation,
          removeBackground,
        }),
        IMAGE_GENERATION_TIMEOUT_MS,
        new ImageGenerationTimeoutError(
          t("timeout", {
            seconds: Math.round(IMAGE_GENERATION_TIMEOUT_MS / 1000),
          }),
        ),
      );

      stopProgress();
      setGenerationProgress(100);

      AnalyticsService.track("stamp_generate_complete", {
        step: "generation",
        prompt_length: prompt.length,
        used_reference_image: Boolean(uploadedImageUrl),
      });

      // Add result to history
      addGeneratedResult(result);
      setSelectedImageUrl(result.imageUrl);
      setEnhancedPrompt(result.enhancedPrompt);

      // Save to localStorage with 24h TTL
      addStoredImage(result);

      // Auto-advance to results after a short delay
      setTimeout(() => {
        nextStep();
      }, 800);

      return result;
    } catch (error) {
      stopProgress();
      setGenerationProgress(0);

      AnalyticsService.track("stamp_generate_failed", {
        step: "generation",
        reason:
          error instanceof ImageGenerationTimeoutError ? "timeout" : "error",
      });

      if (error instanceof ImageGenerationTimeoutError) {
        logStampError({
          scope: "useStampImageGeneration",
          event: "image_generation_timeout",
          error,
          metadata: {
            timeoutMs: IMAGE_GENERATION_TIMEOUT_MS,
          },
        });
        handleError(error);
      } else {
        logStampError({
          scope: "useStampImageGeneration",
          event: "image_generation_failed",
          error,
        });
      }

      throw error;
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  return {
    handleGenerate,
    isGenerating: generateMutation.isPending,
  };
}
