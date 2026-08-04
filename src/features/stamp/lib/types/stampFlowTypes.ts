/**
 * Stamp Flow State Types
 *
 * State management types for the Stamp flow.
 * Follows the pattern from stamp-brutalist but adapted for luxury theme.
 */

import type { ProductTypeIdType } from "./stampTypes";
import type { PlacementParams } from "@/lib/printPlacement/types";

export interface GeneratedResultType {
  imageUrl: string;
  enhancedPrompt: string;
}

/** Re-exported so stamp code has one import site for placement values. */
export type PlacementParamsType = PlacementParams;

/**
 * Per-print-position configuration chosen by the user in Step 6.
 * `position` matches Printify placeholder positions ('front', 'back',
 * 'neck', 'left_sleeve', 'right_sleeve').
 */
export interface PrintPositionConfigType {
  position: string;
  enabled: boolean;
  placement: PlacementParamsType;
  /** Extra cost in cents for printing this position (0 = included). */
  additionalCost: number;
}

export interface MockupImageType {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
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
  selectedProductTitle: string | undefined;
  setSelectedProductTitle: (title: string | undefined) => void;

  // Print position / placement state (Step 6 design adjustment)
  availablePrintPositions: string[];
  setAvailablePrintPositions: (positions: string[]) => void;
  printPositionConfigs: Record<string, PrintPositionConfigType>;
  setPrintPositionConfig: (
    position: string,
    config: Partial<PrintPositionConfigType>,
  ) => void;
  togglePrintPosition: (position: string) => void;
  activeEditPosition: string;
  setActiveEditPosition: (position: string) => void;
  resetPlacementForPosition: (position: string) => void;
  /**
   * Seed positions for the selected product: replaces the available list,
   * creates a config per position (only the first one enabled) and remembers
   * `defaultPlacement` so `resetPlacementForPosition` can restore it.
   */
  initializePrintPositions: (
    positions: string[],
    defaultPlacement: PlacementParamsType,
  ) => void;
  defaultPlacement: PlacementParamsType;

  // Customization selection state
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
  selectedSize: string | undefined;
  setSelectedSize: (size: string | undefined) => void;
  selectedPriceCents: number | undefined;
  setSelectedPriceCents: (price: number | undefined) => void;

  // Created product state
  createdProductId: string | undefined;
  setCreatedProductId: (id: string | undefined) => void;
  createdVariantId: number | undefined;
  setCreatedVariantId: (id: number | undefined) => void;
  mockupImageUrl: string | undefined;
  setMockupImageUrl: (url: string | undefined) => void;
  mockupImages: MockupImageType[];
  setMockupImages: (images: MockupImageType[]) => void;

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
