import { create } from "zustand";
import type {
  GeneratedResultType,
  PlacementParamsType,
  PrintPositionConfigType,
  StampFlowStateType,
} from "../types/stampFlowTypes";
import { STAMP_TOTAL_STEPS } from "../constants/stampSteps";
import { logStampError, logStampWarn } from "../helpers/stampLogger";
import { AnalyticsService } from "@/services/analyticsService";
import { mapStepChangeEvent } from "@/features/analytics/mappers/stampFlowMappers";

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

/** Centered, full-width placement — matches the Printify default. */
export const DEFAULT_PLACEMENT: PlacementParamsType = {
  x: 0.5,
  y: 0.5,
  scale: 1,
  angle: 0,
};

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
  selectedProductTitle: undefined,
  selectedProductDescription: undefined,
  // Print position / placement state
  availablePrintPositions: [] as string[],
  printPositionConfigs: {} as Record<string, PrintPositionConfigType>,
  activeEditPosition: "front",
  defaultPlacement: DEFAULT_PLACEMENT,
  placementSeededBlueprintId: undefined as number | undefined,
  // Customization selection state
  selectedColor: undefined,
  selectedSize: undefined,
  selectedPriceCents: undefined,
  // Created product state
  createdProductId: undefined,
  createdVariantId: undefined,
  mockupImageUrl: undefined,
  mockupImages: [],
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

    // Track step changes for funnel analysis
    const previousStep = useStampFlowStore.getState().currentStep;
    if (step !== previousStep) {
      AnalyticsService.track(
        "step_change",
        mapStepChangeEvent({ fromStep: previousStep, toStep: step })
      );
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
      set((state) => {
        // Check for duplicates - avoid adding the same imageUrl twice
        const isDuplicate = state.generatedResults.some(
          (existing) => existing.imageUrl === result.imageUrl,
        );
        if (isDuplicate) {
          return state;
        }
        return {
          generatedResults: [result, ...state.generatedResults].slice(
            0,
            MAX_GENERATED_RESULTS,
          ),
        };
      });
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
  setSelectedProductTitle: (title) => set({ selectedProductTitle: title }),
  setSelectedProductDescription: (description) => set({ selectedProductDescription: description }),

  // Print position / placement state
  setAvailablePrintPositions: (positions) =>
    set({ availablePrintPositions: positions }),

  setPrintPositionConfig: (position, config) =>
    set((state) => {
      const existing = state.printPositionConfigs[position];
      if (!existing) {
        logStampWarn({
          scope: "stampFlowStore",
          event: "unknown_print_position_rejected",
          metadata: { position },
        });
        return state;
      }
      return {
        printPositionConfigs: {
          ...state.printPositionConfigs,
          [position]: {
            ...existing,
            ...config,
            placement: { ...existing.placement, ...config.placement },
          },
        },
      };
    }),

  togglePrintPosition: (position) =>
    set((state) => {
      const existing = state.printPositionConfigs[position];
      if (!existing) return state;
      return {
        printPositionConfigs: {
          ...state.printPositionConfigs,
          [position]: { ...existing, enabled: !existing.enabled },
        },
      };
    }),

  selectPrintPosition: (position) =>
    set((state) => {
      if (!state.printPositionConfigs[position]) {
        logStampWarn({
          scope: "stampFlowStore",
          event: "unknown_print_position_rejected",
          metadata: { position },
        });
        return state;
      }
      return {
        printPositionConfigs: Object.fromEntries(
          Object.entries(state.printPositionConfigs).map(([key, config]) => [
            key,
            { ...config, enabled: key === position },
          ]),
        ),
        activeEditPosition: position,
      };
    }),

  setActiveEditPosition: (position) => set({ activeEditPosition: position }),

  resetPlacementForPosition: (position) =>
    set((state) => {
      const existing = state.printPositionConfigs[position];
      if (!existing) return state;
      return {
        printPositionConfigs: {
          ...state.printPositionConfigs,
          [position]: { ...existing, placement: { ...state.defaultPlacement } },
        },
      };
    }),

  initializePrintPositions: (positions, defaultPlacement, options) =>
    set(() => {
      const configs: Record<string, PrintPositionConfigType> = {};
      positions.forEach((position, index) => {
        configs[position] = {
          position,
          enabled: options?.enableAll ? true : index === 0,
          placement: { ...(options?.placements?.[position] ?? defaultPlacement) },
          additionalCost: 0,
        };
      });
      return {
        availablePrintPositions: positions,
        printPositionConfigs: configs,
        activeEditPosition: positions[0] ?? "front",
        defaultPlacement,
        placementSeededBlueprintId: options?.blueprintId,
      };
    }),

  // Customization selection
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setSelectedPriceCents: (price) => set({ selectedPriceCents: price }),

  // Product state
  setCreatedProductId: (id) => set({ createdProductId: id }),
  setCreatedVariantId: (id) => set({ createdVariantId: id }),
  setMockupImageUrl: (url) => set({ mockupImageUrl: url }),
  setMockupImages: (images) => set({ mockupImages: images }),

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

  // Reset for creating another product with same image
  resetForNewProduct: () => {
    try {
      set((state) => ({
        // Keep the selected image and enhanced prompt
        selectedImageUrl: state.selectedImageUrl,
        enhancedPrompt: state.enhancedPrompt,
        // Keep generated results for reference
        generatedResults: state.generatedResults,
        // Reset product selection
        selectedProductType: "tshirt" as const,
        blueprintId: undefined,
        printProviderId: undefined,
        selectedProductTitle: undefined,
        selectedProductDescription: undefined,
        // Reset print positions
        availablePrintPositions: [],
        printPositionConfigs: {},
        activeEditPosition: "front",
        placementSeededBlueprintId: undefined,
        // Reset customization
        selectedColor: undefined,
        selectedSize: undefined,
        selectedPriceCents: undefined,
        // Reset created product
        createdProductId: undefined,
        createdVariantId: undefined,
        mockupImageUrl: undefined,
        mockupImages: [],
        // Reset progress
        productionProgress: 0,
        // Navigate to product selection step (step 5)
        currentStep: 5,
      }));
    } catch (error) {
      logStampError({
        scope: "stampFlowStore",
        event: "reset_for_new_product_failed",
        error,
      });
    }
  },
}));

