import { useContext } from "react";
import { CreateProductSubscriberContext } from "./CreateProductContextSubscriber";
import { TshirtType } from "@/features/dashboard/selectTshirt";
import { IImageGenerationForm, IImageGenerationResult } from "@/schemas/imageGenerationSchema";
import { CreatedProduct } from "@/services/customProductService";

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
        currentStep: "form",
      });
    },

    /**
     * Handle "Use this image" click - transition to customizer
     */
    handleUseImage: () => {
      const state = store.getState();
      store.setState({
        ...state,
        currentStep: "customizing",
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
     * Handle t-shirt selection
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
      });
    },

    /**
     * Handle successful product creation
     */
    handleProductCreationSuccess: (product: CreatedProduct) => {
      const state = store.getState();
      store.setState({
        ...state,
        isCreatingProduct: false,
        createdProduct: product,
        currentStep: "created",
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
        currentStep: "form",
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
  };
}
