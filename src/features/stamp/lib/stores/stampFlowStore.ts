import { create } from "zustand";
import type {
  GeneratedResultType,
  StampFlowStateType,
} from "../types/stampFlowTypes";
import { STAMP_TOTAL_STEPS } from "../constants/stampSteps";
import { logStampError, logStampWarn } from "../helpers/stampLogger";

/**
 * Stamp Flow Store
 *
 * Zustand store for managing the luxury theme stamp flow state.
 * Fine-grained state with automatic selector memoization.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_GENERATED_RESULTS = 20;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  currentStep: 0,
  uploadedImageUrl: null,
  generatedResults: [],
  isGenerating: false,
  isFinalizing: false,
  selectedImageUrl: undefined,
  enhancedPrompt: undefined,
  selectedProductType: "tshirt" as const,
  blueprintId: undefined,
  printProviderId: undefined,
  createdProductId: undefined,
  createdVariantId: undefined,
  mockupImageUrl: undefined,
  generationProgress: 0,
  productionProgress: 0,
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const isValidStep = (step: number): boolean => {
  return step >= 0 && step <= STAMP_TOTAL_STEPS;
};

const isValidGeneratedResult = (
  result: GeneratedResultType,
): result is GeneratedResultType => {
  return Boolean(result?.imageUrl && result?.enhancedPrompt);
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useStampFlowStore = create<StampFlowStateType>((set) => ({
  // Initial state
  ...initialState,

  // Step navigation with validation
  setCurrentStep: (step) => {
    if (!isValidStep(step)) {
      logStampWarn({
        scope: "stampFlowStore",
        event: "invalid_step_rejected",
        metadata: {
          step,
          maxStep: STAMP_TOTAL_STEPS,
        },
      });
      return;
    }
    set({ currentStep: step });
  },

  // Upload state
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),

  // Generated results management
  setGeneratedResults: (results) => {
    try {
      set((state) => ({
        generatedResults: typeof results === "function"
          ? results(state.generatedResults)
          : results,
      }));
    } catch (error) {
      logStampError({
        scope: "stampFlowStore",
        event: "set_generated_results_failed",
        error,
      });
    }
  },

  addGeneratedResult: (result) => {
    if (!isValidGeneratedResult(result)) {
      logStampWarn({
        scope: "stampFlowStore",
        event: "invalid_generated_result_rejected",
        metadata: { result },
      });
      return;
    }

    try {
      set((state) => ({
        generatedResults: [result, ...state.generatedResults].slice(
          0,
          MAX_GENERATED_RESULTS,
        ),
      }));
    } catch (error) {
      logStampError({
        scope: "stampFlowStore",
        event: "add_generated_result_failed",
        error,
        metadata: { result },
      });
    }
  },

  // Loading states
  setIsGenerating: (value) => set({ isGenerating: value }),
  setIsFinalizing: (value) => set({ isFinalizing: value }),

  // Selection state
  setSelectedImageUrl: (url) => set({ selectedImageUrl: url }),
  setEnhancedPrompt: (prompt) => set({ enhancedPrompt: prompt }),

  // Product selection
  setSelectedProductType: (productType) =>
    set({ selectedProductType: productType }),
  setBlueprintId: (id) => set({ blueprintId: id }),
  setPrintProviderId: (id) => set({ printProviderId: id }),

  // Product state
  setCreatedProductId: (id) => set({ createdProductId: id }),
  setCreatedVariantId: (id) => set({ createdVariantId: id }),
  setMockupImageUrl: (url) => set({ mockupImageUrl: url }),

  // Progress tracking
  setGenerationProgress: (progress) =>
    set((state) => ({
      generationProgress: typeof progress === "function"
        ? progress(state.generationProgress)
        : progress,
    })),
  setProductionProgress: (progress) =>
    set((state) => ({
      productionProgress: typeof progress === "function"
        ? progress(state.productionProgress)
        : progress,
    })),

  // Reset with error handling
  reset: () => {
    try {
      set(initialState);
    } catch (error) {
      logStampError({
        scope: "stampFlowStore",
        event: "reset_failed",
        error,
      });
    }
  },
}));
