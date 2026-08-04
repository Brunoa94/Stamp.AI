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
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logStampError, logStampWarn } from "../helpers/stampLogger";
import { withTimeout } from "@/lib/promiseUtils";
import { AnalyticsService } from "@/services/analyticsService";

/**
 * useStampImageGeneration
 *
 * Hook for handling AI image generation in Stamp.
 * Integrates with the existing ImageGenerationService.
 *
 * Error Handling Pattern:
 * - Implements idempotency checks to prevent duplicate generation requests
 * - Uses timeout handling for long-running AI operations
 * - Provides clear user-facing error messages with recovery paths
 */

const IMAGE_GENERATION_TIMEOUT_MS = 90_000; // 90 seconds for AI generation

class ImageGenerationTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageGenerationTimeoutError";
  }
}

interface GenerateImageParamsType {
  prompt: string;
  preservation: number;
}

// Art-style selection was removed from the UI; the generation API still
// accepts a style, so we send a sensible default.
const DEFAULT_SYNTHESIS_STYLE = "editorial";

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

  // Idempotency: Track if generation is in progress to prevent duplicates
  const isGeneratingRef = useRef(false);

  const handleGenerate = async ({
    prompt,
    preservation,
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
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      // Wrap mutation with timeout
      const result = await withTimeout(
        generateMutation.mutateAsync({
          image: uploadedImageUrl ? new File([], "reference") : undefined,
          prompt,
          selectedStyle: DEFAULT_SYNTHESIS_STYLE,
          preservation: uploadedImageUrl ? preservation : undefined,
        } as any),
        IMAGE_GENERATION_TIMEOUT_MS,
        new ImageGenerationTimeoutError(
          t("timeout", {
            seconds: Math.round(IMAGE_GENERATION_TIMEOUT_MS / 1000),
          }),
        ),
      );

      clearInterval(progressInterval);
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

      // Save to localStorage for persistence
      try {
        const currentResults = JSON.parse(
          localStorage.getItem("stamp:generated-history") || "[]",
        );
        const updatedResults = [result, ...currentResults].slice(0, 20);
        localStorage.setItem(
          "stamp:generated-history",
          JSON.stringify(updatedResults),
        );
      } catch (storageError) {
        logStampWarn({
          scope: "useStampImageGeneration",
          event: "generated_history_persist_failed",
          error: storageError,
        });
      }

      // Auto-advance to results after a short delay
      setTimeout(() => {
        nextStep();
      }, 800);

      return result;
    } catch (error) {
      clearInterval(progressInterval);
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
