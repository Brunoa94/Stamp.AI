import { create } from "zustand";
import type { GeneratedResultTypes, StampFlowStateTypes } from "../types/stampFlowTypes";
import {
  isValidStep,
  isValidGeneratedResult,
  logStampWarning,
  logStampError,
  logStampInfo,
} from "../helpers/stampErrorHelpers";

// ============================================================================
// CONSTANTS
// ============================================================================

const TOTAL_STEPS = 8;
const MAX_GENERATED_RESULTS = 20;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  currentStep: 1,
  generatedResults: [],
  isGenerating: false,
  isFinalizing: false,
  selectedImageUrl: undefined,
  enhancedPrompt: undefined,
  createdProductId: undefined,
  createdVariantId: undefined,
  mockupImageUrl: undefined,
};

// ============================================================================
// ZUSTAND STORE - Fine-grained state with automatic selector memoization
// ============================================================================

export const useStampFlowStore = create<StampFlowStateTypes>((set) => ({
  // Initial state
  ...initialState,

  // Step navigation with validation
  setCurrentStep: (step) => {
    if (!isValidStep(step, TOTAL_STEPS)) {
      logStampWarning("setCurrentStep", `Invalid step: ${step}. Must be between 1 and ${TOTAL_STEPS}`);
      return;
    }
    set({ currentStep: step });
  },

  // Generated results management
  setGeneratedResults: (results) => {
    try {
      set((state) => ({
        generatedResults:
          typeof results === "function" ? results(state.generatedResults) : results,
      }));
    } catch (error) {
      logStampError("setGeneratedResults", error);
    }
  },

  addGeneratedResult: (result) => {
    if (!isValidGeneratedResult(result)) {
      logStampWarning("addGeneratedResult", "Cannot add invalid result", { result });
      return;
    }

    try {
      set((state) => ({
        generatedResults: [result, ...state.generatedResults].slice(0, MAX_GENERATED_RESULTS),
      }));
    } catch (error) {
      logStampError("addGeneratedResult", error, { result });
    }
  },

  // Loading states
  setIsGenerating: (value) => set({ isGenerating: value }),
  setIsFinalizing: (value) => set({ isFinalizing: value }),

  // Selection state
  setSelectedImageUrl: (url) => set({ selectedImageUrl: url }),
  setEnhancedPrompt: (prompt) => set({ enhancedPrompt: prompt }),

  // Product state
  setCreatedProductId: (id) => set({ createdProductId: id }),
  setCreatedVariantId: (id) => set({ createdVariantId: id }),
  setMockupImageUrl: (url) => set({ mockupImageUrl: url }),

  // Reset with error handling
  reset: () => {
    try {
      set(initialState);
      logStampInfo("reset", "Store reset to initial state");
    } catch (error) {
      logStampError("reset", error);
    }
  },
}));
