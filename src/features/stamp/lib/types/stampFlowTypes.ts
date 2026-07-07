/**
 * Stamp Flow State Types
 *
 * State management types for the Stamp flow.
 * Follows the pattern from stamp-brutalist but adapted for luxury theme.
 */

import type { ProductTypeIdType } from "./stampTypes";

export interface GeneratedResultType {
  imageUrl: string;
  enhancedPrompt: string;
}

export interface StampFlowStateType {
  // Step navigation (lightweight - high frequency updates)
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Upload state
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;

  // Generation state
  generatedResults: GeneratedResultType[];
  setGeneratedResults: (
    results:
      | GeneratedResultType[]
      | ((prev: GeneratedResultType[]) => GeneratedResultType[]),
  ) => void;
  addGeneratedResult: (result: GeneratedResultType) => void;

  // Loading states
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  isFinalizing: boolean;
  setIsFinalizing: (value: boolean) => void;

  // Selected state from generation
  selectedImageUrl: string | undefined;
  setSelectedImageUrl: (url: string | undefined) => void;
  enhancedPrompt: string | undefined;
  setEnhancedPrompt: (prompt: string | undefined) => void;

  // Product selection state
  selectedProductType: ProductTypeIdType;
  setSelectedProductType: (productType: ProductTypeIdType) => void;

  // Product selection state (real catalog values)
  blueprintId: number | undefined;
  setBlueprintId: (id: number | undefined) => void;
  printProviderId: number | undefined;
  setPrintProviderId: (id: number | undefined) => void;

  // Created product state
  createdProductId: string | undefined;
  setCreatedProductId: (id: string | undefined) => void;
  createdVariantId: number | undefined;
  setCreatedVariantId: (id: number | undefined) => void;
  mockupImageUrl: string | undefined;
  setMockupImageUrl: (url: string | undefined) => void;

  // Progress tracking
  generationProgress: number;
  setGenerationProgress: (
    progress: number | ((prev: number) => number),
  ) => void;
  productionProgress: number;
  setProductionProgress: (
    progress: number | ((prev: number) => number),
  ) => void;

  // Reset
  reset: () => void;
}
