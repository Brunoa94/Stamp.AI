"use client";

import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { StampFormData } from "../schemas/stampFormSchema";
import { useStampFlowStore } from "../context/StampFormContext";
import { useImageGeneration as useImageGenerationMutation } from "@/queries/imageGenerationQueries";
import {
  logStampInfo,
  logStampError,
  logStampWarning,
  safeLocalStorageSave,
  getStampErrorMessage,
} from "../helpers/stampErrorHelpers";

export function useStampImageGeneration() {
  const { watch, trigger } = useFormContext<StampFormData>();

  const setCurrentStep = useStampFlowStore((s) => s.setCurrentStep);
  const addGeneratedResult = useStampFlowStore((s) => s.addGeneratedResult);
  const isGenerating = useStampFlowStore((s) => s.isGenerating);
  const setIsGenerating = useStampFlowStore((s) => s.setIsGenerating);
  const setSelectedImageUrl = useStampFlowStore((s) => s.setSelectedImageUrl);
  const setEnhancedPrompt = useStampFlowStore((s) => s.setEnhancedPrompt);

  const generateMutation = useImageGenerationMutation();

  const handleGenerate = async () => {
    // Validate prompt before generating
    const isValid = await trigger(["prompt"]);
    if (!isValid) {
      const errorMsg = getStampErrorMessage("MISSING_PROMPT");
      toast.error(errorMsg);
      logStampWarning("handleGenerate", "Form validation failed for prompt");
      return;
    }

    const { referenceImage, prompt, artStyle, preservation } = watch();

    logStampInfo("handleGenerate", "Starting image generation", {
      hasReferenceImage: !!referenceImage,
      artStyle,
      promptLength: prompt?.length || 0,
    });

    setIsGenerating(true);

    try {
      const result = await generateMutation.mutateAsync({
        image: referenceImage as File,
        prompt,
        selectedStyle: artStyle,
        preservation: referenceImage ? preservation : undefined,
      } as any);

      logStampInfo("handleGenerate", "Image generation successful", {
        imageUrl: result.imageUrl,
        hasEnhancedPrompt: !!result.enhancedPrompt,
      });

      // Add result to history (max 20 items handled by store with validation)
      addGeneratedResult(result);
      setSelectedImageUrl(result.imageUrl);
      setEnhancedPrompt(result.enhancedPrompt);

      // Save to localStorage for persistence (non-critical operation)
      const currentResults = useStampFlowStore.getState().generatedResults;
      const saved = safeLocalStorageSave(
        "stamp-brutalist:generated-history",
        currentResults
      );

      if (saved) {
        logStampInfo("handleGenerate", "Results saved to localStorage");
      }

      // Auto-advance to results with smooth scroll (only on mobile)
      setCurrentStep(4);
      setTimeout(() => {
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        if (isMobile) {
          const section = document.getElementById("step-4");
          section?.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

      return result;
    } catch (error) {
      logStampError("handleGenerate", error, {
        prompt,
        artStyle,
        hasReferenceImage: !!referenceImage,
      });

      const errorMsg = getStampErrorMessage("GENERATION_FAILED");
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleGenerate,
    isGenerating,
  };
}
