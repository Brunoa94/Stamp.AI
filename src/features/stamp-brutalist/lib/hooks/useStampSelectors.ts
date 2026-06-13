import { useStampFlowStore } from "../stores/stampFlowStore";

// ============================================================================
// HELPER FUNCTION - DRY principle for error handling
// ============================================================================

/**
 * Creates a safe selector with error handling
 * @param hookName - Name of the hook for error messages
 * @param selector - Function to select state from store
 * @param fallback - Fallback value if store access fails
 */
function createSafeSelector<T>(
  hookName: string,
  selector: () => T,
  fallback: T
): T {
  try {
    return selector();
  } catch (error) {
    console.error(`[${hookName}] Error accessing store:`, error);
    return fallback;
  }
}

// ============================================================================
// SELECTOR HOOKS - Use these for fine-grained subscriptions
// ============================================================================

/**
 * Selector for step-only components (StampIconSidebar, StampMobileProgress)
 * Only re-renders when currentStep changes
 *
 * @returns {Object} Current step state and setter
 * @example
 * const { currentStep, setCurrentStep } = useStampStep();
 * setCurrentStep(2);
 */
export const useStampStep = () => {
  return createSafeSelector(
    "useStampStep",
    () => {
      const currentStep = useStampFlowStore((state) => state.currentStep);
      const setCurrentStep = useStampFlowStore((state) => state.setCurrentStep);
      return { currentStep, setCurrentStep };
    },
    {
      currentStep: 1,
      setCurrentStep: () => console.warn("[useStampStep] Store not available"),
    }
  );
};

/**
 * Selector for generation state
 * Use this hook in components that handle image generation
 *
 * @returns {Object} Generation state including results and loading state
 * @example
 * const { isGenerating, generatedResults, addGeneratedResult } = useStampGeneration();
 */
export const useStampGeneration = () => {
  return createSafeSelector(
    "useStampGeneration",
    () => {
      const isGenerating = useStampFlowStore((state) => state.isGenerating);
      const setIsGenerating = useStampFlowStore((state) => state.setIsGenerating);
      const generatedResults = useStampFlowStore((state) => state.generatedResults);
      const setGeneratedResults = useStampFlowStore((state) => state.setGeneratedResults);
      const addGeneratedResult = useStampFlowStore((state) => state.addGeneratedResult);
      return {
        isGenerating,
        setIsGenerating,
        generatedResults,
        setGeneratedResults,
        addGeneratedResult,
      };
    },
    {
      isGenerating: false,
      setIsGenerating: () => console.warn("[useStampGeneration] Store not available"),
      generatedResults: [],
      setGeneratedResults: () => console.warn("[useStampGeneration] Store not available"),
      addGeneratedResult: () => console.warn("[useStampGeneration] Store not available"),
    }
  );
};

/**
 * Selector for finalization state
 * Use this hook in components that handle product creation and finalization
 *
 * @returns {Object} Finalization state including product data and loading state
 * @example
 * const { isFinalizing, createdProductId, setCreatedProductId } = useStampFinalization();
 */
export const useStampFinalization = () => {
  return createSafeSelector(
    "useStampFinalization",
    () => {
      const isFinalizing = useStampFlowStore((state) => state.isFinalizing);
      const setIsFinalizing = useStampFlowStore((state) => state.setIsFinalizing);
      const createdProductId = useStampFlowStore((state) => state.createdProductId);
      const setCreatedProductId = useStampFlowStore((state) => state.setCreatedProductId);
      const mockupImageUrl = useStampFlowStore((state) => state.mockupImageUrl);
      const setMockupImageUrl = useStampFlowStore((state) => state.setMockupImageUrl);
      return {
        isFinalizing,
        setIsFinalizing,
        createdProductId,
        setCreatedProductId,
        mockupImageUrl,
        setMockupImageUrl,
      };
    },
    {
      isFinalizing: false,
      setIsFinalizing: () => console.warn("[useStampFinalization] Store not available"),
      createdProductId: undefined,
      setCreatedProductId: () => console.warn("[useStampFinalization] Store not available"),
      mockupImageUrl: undefined,
      setMockupImageUrl: () => console.warn("[useStampFinalization] Store not available"),
    }
  );
};

/**
 * Selector for selected image from generation
 * Use this hook to access the currently selected image and its enhanced prompt
 *
 * @returns {Object} Selected image state
 * @example
 * const { selectedImageUrl, enhancedPrompt } = useStampSelectedImage();
 */
export const useStampSelectedImage = () => {
  return createSafeSelector(
    "useStampSelectedImage",
    () => {
      const selectedImageUrl = useStampFlowStore((state) => state.selectedImageUrl);
      const setSelectedImageUrl = useStampFlowStore((state) => state.setSelectedImageUrl);
      const enhancedPrompt = useStampFlowStore((state) => state.enhancedPrompt);
      const setEnhancedPrompt = useStampFlowStore((state) => state.setEnhancedPrompt);
      return { selectedImageUrl, setSelectedImageUrl, enhancedPrompt, setEnhancedPrompt };
    },
    {
      selectedImageUrl: undefined,
      setSelectedImageUrl: () => console.warn("[useStampSelectedImage] Store not available"),
      enhancedPrompt: undefined,
      setEnhancedPrompt: () => console.warn("[useStampSelectedImage] Store not available"),
    }
  );
};

/**
 * @deprecated Use specific selector hooks for better performance.
 * This provides all data state - use only when you need everything.
 *
 * Consider using:
 * - useStampStep() for step navigation
 * - useStampGeneration() for generation state
 * - useStampFinalization() for finalization state
 * - useStampSelectedImage() for selected image state
 */
export const useStampData = () => {
  try {
    return useStampFlowStore();
  } catch (error) {
    console.error("[useStampData] Error accessing store:", error);
    throw new Error("Stamp flow store is not available. Ensure StampFormProvider is wrapping your component.");
  }
};
