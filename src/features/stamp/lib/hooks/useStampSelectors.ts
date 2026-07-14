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

// Reset store selector
export const useStampReset = () => {
  const reset = useStampFlowStore((state) => state.reset);
  return { reset };
};

/**
 * Step accessibility selector
 *
 * Determines which steps are accessible based on completion state.
 * Users can only navigate to steps that have their prerequisites met.
 */
export const useStampStepAccessibility = () => {
  const currentStep = useStampFlowStore((state) => state.currentStep);
  const generatedResults = useStampFlowStore(
    (state) => state.generatedResults,
  );
  const selectedImageUrl = useStampFlowStore(
    (state) => state.selectedImageUrl,
  );
  const blueprintId = useStampFlowStore((state) => state.blueprintId);
  const printProviderId = useStampFlowStore((state) => state.printProviderId);
  const selectedColor = useStampFlowStore((state) => state.selectedColor);
  const createdProductId = useStampFlowStore(
    (state) => state.createdProductId,
  );

  /**
   * Returns the highest step that is currently accessible.
   * Steps become accessible when their prerequisites are complete.
   */
  const getMaxAccessibleStep = (): number => {
    // Step 0-2: Always accessible (hero, upload, synthesis)
    // Step 3-4: Accessible once generation has results
    if (generatedResults.length === 0) return 2;

    // Step 5: Accessible once an image is selected
    if (!selectedImageUrl) return 4;

    // Step 6: Accessible once a product is selected
    if (!blueprintId || !printProviderId) return 5;

    // Step 7: Accessible once customization is done (color selected)
    if (!selectedColor) return 6;

    // Step 8: Accessible once product is created
    if (!createdProductId) return 7;

    // All steps accessible
    return 8;
  };

  /**
   * Check if a specific step is accessible
   */
  const isStepAccessible = (step: number): boolean => {
    // Can always go back to current or previous steps
    if (step <= currentStep) return true;

    // Can only go forward up to max accessible step
    return step <= getMaxAccessibleStep();
  };

  return {
    currentStep,
    getMaxAccessibleStep,
    isStepAccessible,
  };
};
