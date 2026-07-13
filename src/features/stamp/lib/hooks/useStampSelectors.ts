"use client";

import { useStampFlowStore } from "../stores/stampFlowStore";

/**
 * useStampSelectors
 *
 * Optimized selectors for accessing Stamp store state.
 * Each property is subscribed independently to prevent unnecessary re-renders.
 */

// Step state selectors
export const useStampStep = () => {
  const currentStep = useStampFlowStore((state) => state.currentStep);
  const setCurrentStep = useStampFlowStore((state) => state.setCurrentStep);
  return { currentStep, setCurrentStep };
};

// Generation state selectors
export const useStampGeneration = () => {
  const isGenerating = useStampFlowStore((state) => state.isGenerating);
  const setIsGenerating = useStampFlowStore((state) => state.setIsGenerating);
  const generatedResults = useStampFlowStore(
    (state) => state.generatedResults,
  );
  const setGeneratedResults = useStampFlowStore(
    (state) => state.setGeneratedResults,
  );
  const addGeneratedResult = useStampFlowStore(
    (state) => state.addGeneratedResult,
  );
  const generationProgress = useStampFlowStore(
    (state) => state.generationProgress,
  );
  const setGenerationProgress = useStampFlowStore(
    (state) => state.setGenerationProgress,
  );
  return {
    isGenerating,
    setIsGenerating,
    generatedResults,
    setGeneratedResults,
    addGeneratedResult,
    generationProgress,
    setGenerationProgress,
  };
};

// Finalization state selectors
export const useStampFinalization = () => {
  const isFinalizing = useStampFlowStore((state) => state.isFinalizing);
  const setIsFinalizing = useStampFlowStore((state) => state.setIsFinalizing);
  const createdProductId = useStampFlowStore(
    (state) => state.createdProductId,
  );
  const setCreatedProductId = useStampFlowStore(
    (state) => state.setCreatedProductId,
  );
  const createdVariantId = useStampFlowStore(
    (state) => state.createdVariantId,
  );
  const setCreatedVariantId = useStampFlowStore(
    (state) => state.setCreatedVariantId,
  );
  const mockupImageUrl = useStampFlowStore((state) => state.mockupImageUrl);
  const setMockupImageUrl = useStampFlowStore(
    (state) => state.setMockupImageUrl,
  );
  const productionProgress = useStampFlowStore(
    (state) => state.productionProgress,
  );
  const setProductionProgress = useStampFlowStore(
    (state) => state.setProductionProgress,
  );
  return {
    isFinalizing,
    setIsFinalizing,
    createdProductId,
    setCreatedProductId,
    createdVariantId,
    setCreatedVariantId,
    mockupImageUrl,
    setMockupImageUrl,
    productionProgress,
    setProductionProgress,
  };
};

// Selected image state selectors
export const useStampSelectedImage = () => {
  const selectedImageUrl = useStampFlowStore(
    (state) => state.selectedImageUrl,
  );
  const setSelectedImageUrl = useStampFlowStore(
    (state) => state.setSelectedImageUrl,
  );
  const enhancedPrompt = useStampFlowStore((state) => state.enhancedPrompt);
  const setEnhancedPrompt = useStampFlowStore(
    (state) => state.setEnhancedPrompt,
  );
  return {
    selectedImageUrl,
    setSelectedImageUrl,
    enhancedPrompt,
    setEnhancedPrompt,
  };
};

// Upload state selectors
export const useStampUpload = () => {
  const uploadedImageUrl = useStampFlowStore(
    (state) => state.uploadedImageUrl,
  );
  const setUploadedImageUrl = useStampFlowStore(
    (state) => state.setUploadedImageUrl,
  );
  return { uploadedImageUrl, setUploadedImageUrl };
};

// Product selection state selectors
export const useStampProductSelection = () => {
  const selectedProductType = useStampFlowStore(
    (state) => state.selectedProductType,
  );
  const setSelectedProductType = useStampFlowStore(
    (state) => state.setSelectedProductType,
  );
  const blueprintId = useStampFlowStore((state) => state.blueprintId);
  const setBlueprintId = useStampFlowStore((state) => state.setBlueprintId);
  const printProviderId = useStampFlowStore((state) => state.printProviderId);
  const setPrintProviderId = useStampFlowStore(
    (state) => state.setPrintProviderId,
  );
  return {
    selectedProductType,
    setSelectedProductType,
    blueprintId,
    setBlueprintId,
    printProviderId,
    setPrintProviderId,
  };
};

// Customization selection state selectors
export const useStampCustomization = () => {
  const selectedColor = useStampFlowStore((state) => state.selectedColor);
  const setSelectedColor = useStampFlowStore((state) => state.setSelectedColor);
  const selectedSize = useStampFlowStore((state) => state.selectedSize);
  const setSelectedSize = useStampFlowStore((state) => state.setSelectedSize);
  const selectedPriceCents = useStampFlowStore(
    (state) => state.selectedPriceCents,
  );
  const setSelectedPriceCents = useStampFlowStore(
    (state) => state.setSelectedPriceCents,
  );
  return {
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedPriceCents,
    setSelectedPriceCents,
  };
};

// Combined data selector for convenience
export const useStampData = () => {
  const currentStep = useStampFlowStore((state) => state.currentStep);
  const uploadedImageUrl = useStampFlowStore(
    (state) => state.uploadedImageUrl,
  );
  const generatedResults = useStampFlowStore(
    (state) => state.generatedResults,
  );
  const selectedImageUrl = useStampFlowStore(
    (state) => state.selectedImageUrl,
  );
  const enhancedPrompt = useStampFlowStore((state) => state.enhancedPrompt);
  const createdProductId = useStampFlowStore(
    (state) => state.createdProductId,
  );
  const mockupImageUrl = useStampFlowStore((state) => state.mockupImageUrl);
  return {
    currentStep,
    uploadedImageUrl,
    generatedResults,
    selectedImageUrl,
    enhancedPrompt,
    createdProductId,
    mockupImageUrl,
  };
};
