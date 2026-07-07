"use client";

import { useRef } from "react";
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
  constructor(timeoutMs: number) {
    super(
      `Image generation timed out after ${
        Math.round(timeoutMs / 1000)
      } seconds. ` +
        `Please try again with a simpler prompt or contact support.`,
    );
    this.name = "ImageGenerationTimeoutError";
  }
}

interface GenerateImageParamsType {
  prompt: string;
  artStyle: string;
  preservation: number;
}

export function useStampImageGeneration() {
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
    artStyle,
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
      handleError(new Error("Please enter a description for your design"));
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
          selectedStyle: artStyle,
          preservation: uploadedImageUrl ? preservation : undefined,
        } as any),
        IMAGE_GENERATION_TIMEOUT_MS,
        new ImageGenerationTimeoutError(IMAGE_GENERATION_TIMEOUT_MS),
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);

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
