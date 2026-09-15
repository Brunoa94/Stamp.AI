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
import { useQueryClient } from "@tanstack/react-query";
import { coinsKeys } from "@/queries/coinsQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logStampError, logStampWarn } from "../helpers/stampLogger";
import { withTimeout } from "@/lib/promiseUtils";
import { AnalyticsService } from "@/services/analyticsService";
import {
  mapGenerateCompleteEvent,
  mapGenerateFailedEvent,
} from "@/features/analytics/mappers/stampFlowMappers";
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
 * - The coin is deducted server-side by /api/generate-image (and refunded
 *   there if generation fails); a 402 INSUFFICIENT_COINS is surfaced through
 *   the mutation's error handler.
 * - The cached balance is refreshed after every attempt.
 */

interface GenerateImageParamsType {
  prompt: string;
  preservation: number;
  removeBackground: boolean;
}

export function useStampImageGeneration() {
  const t = useTranslations("stamp.errors.imageGeneration");
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
  const queryClient = useQueryClient();

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

      // Wrap mutation with timeout (the API route charges the coin)
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

      AnalyticsService.track(
        "stamp_generate_complete",
        mapGenerateCompleteEvent({
          promptLength: prompt.length,
          usedReferenceImage: Boolean(uploadedImageUrl),
        })
      );

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

      AnalyticsService.track(
        "stamp_generate_failed",
        mapGenerateFailedEvent({
          reason: error instanceof ImageGenerationTimeoutError ? "timeout" : "error",
        })
      );

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
      // Balance changed server-side (deduction, or refund on failure)
      queryClient.invalidateQueries({ queryKey: coinsKeys.all });
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  return {
    handleGenerate,
    isGenerating: generateMutation.isPending,
  };
}
