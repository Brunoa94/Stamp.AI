import { useContext } from "react";
import type { TshirtType } from "@/queries/productQueries";
import { IImageGenerationResult } from "@/schemas/productCreateSchema";
import { CreatedProductT } from "@/types/customProduct";
import { CreateProductSubscriberContext } from "./CreateProductContextSubscriber";
import { WorkflowStep } from "./types";

/**
 * Hook for create product action handlers using store pattern
 * Components using this hook re-render when actions are called
 *
 * @example
 * const { handleFormSubmit, handleUseImage } = useCreateProductSubscriberActions();
 */
export function useCreateProductSubscriberActions() {
  const store = useContext(CreateProductSubscriberContext);
  if (!store)
    throw new Error(
      "useCreateProductSubscriberActions must be used within CreateProductSubscriberProvider",
    );

  return {
    /**
     * Mark a wizard step as completed (idempotent)
     */
    handleCompleteStep: (stepId: WorkflowStep) => {
      const state = store.getState();
      if (state.completedSteps.includes(stepId)) return;

      store.setState({
        ...state,
        completedSteps: [...state.completedSteps, stepId],
      });
    },

    /**
     * Set current internal step directly
     */
    handleSetCurrentStep: (step: WorkflowStep) => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: step,
      });
    },

    /**
     * Handle form submission - start generation process
     */
    handleFormSubmit: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "generating",
        selectedTshirt: null,
        generatedResult: null,
        generationError: null,
        createdProduct: null,
      });
    },

    /**
     * Handle generation start
     */
    handleGenerationStart: () => {
      const state = store.getState();
      store.setState({
        ...state,
        isGenerating: true,
        generationError: null,
      });
    },

    /**
     * Handle successful image generation
     */
    handleGenerationSuccess: (result: IImageGenerationResult) => {
      const state = store.getState();
      store.setState({
        ...state,
        isGenerating: false,
        generatedResult: result,
        currentStep: "results",
      });
    },

    /**
     * Handle image generation error
     */
    handleGenerationError: (error: Error) => {
      const state = store.getState();
      store.setState({
        ...state,
        isGenerating: false,
        generationError: error,
        currentStep: "upload",
      });
    },

    /**
     * Handle "Use this image" click - transition to fabric selection
     */
    handleUseImage: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "fabric",
      });
    },

    /**
     * Handle back to results from customizer
     */
    handleBackToResults: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "results",
      });
    },

    /**
     * Handle t-shirt selection - stay on fabric step
     */
    handleTshirtSelect: (tshirt: TshirtType | null) => {
      const state = store.getState();
      
      store.setState({
        ...state,
        selectedTshirt: tshirt,
      });
    },

    /**
     * Handle product creation start
     */
    handleProductCreationStart: () => {
      const state = store.getState();
      store.setState({
        ...state,
        isCreatingProduct: true,
        currentStep: "creating", // Show loading state
      });
    },

    /**
     * Handle successful product creation
     */
    handleProductCreationSuccess: (product: CreatedProductT) => {
      const state = store.getState();
      store.setState({
        ...state,
        isCreatingProduct: false,
        createdProduct: product,
        currentStep: "sizing", // Move to sizing step to show confirmation
      });
    },

    /**
     * Handle product creation error
     */
    handleProductCreationError: () => {
      const state = store.getState();
      store.setState({
        ...state,
        isCreatingProduct: false,
      });
    },

    /**
     * Handle moving to synthesis step (after upload)
     */
    handleMoveToSynthesis: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "synthesis",
      });
    },

    /**
     * Handle moving to review step (from results)
     */
    handleMoveToReview: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "review",
      });
    },

    /**
     * Handle going back to synthesis (from review to revise artwork)
     */
    handleBackToSynthesis: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "synthesis",
        generatedResult: null,
      });
    },

    /**
     * Handle image removal from form
     */
    handleRemoveImage: () => {
      const state = store.getState();

      // Clear form value
      if (state.form) {
        state.form.setValue("image", undefined as any);
      }

      // Update context state
      store.setState({
        ...state,
        uploadedImage: null,
        currentStep: "upload",
      });
    },

    /**
     * Reset to initial state
     */
    handleReset: () => {
      const state = store.getState();

      // Reset form values
      if (state.form) {
        state.form.reset();
      }

      store.setState({
        ...state,
        currentStep: "upload",
        completedSteps: [],
        isGenerating: false,
        generatedResult: null,
        generationError: null,
        selectedTshirt: null,
        isCreatingProduct: false,
        createdProduct: null,
        uploadedImage: null,
        prompt: "",
      });
    },

    /**
     * Handle direct step navigation (from sidebar)
     */
    handleSetStep: (step: "upload" | "synthesis" | "review" | "fabric" | "sizing") => {
      const state = store.getState();

      // Map sidebar steps to internal workflow steps
      const stepMap: Record<typeof step, string> = {
        upload: "upload",
        synthesis: "synthesis",
        review: state.generatedResult ? "results" : "review",
        fabric: "fabric",
        sizing: "sizing",
      };

      const targetStep = stepMap[step] as any;

      store.setState({
        ...state,
        currentStep: targetStep,
      });
    },
  };
}
