import { useContext, useMemo } from "react";
import type { TshirtType } from "@/queries/productQueries";
import { IImageGenerationResult } from "@/schemas/productCreateSchema";
import { CreatedProductT } from "@/types/customProduct";
import {
  NavigationSubscriberContext,
  FormSubscriberContext,
} from "./CreateProductContextSubscriber";
import { WorkflowStep } from "./types";

/**
 * Hook for create product action handlers.
 *
 * Actions are stable across renders (useMemo with store deps that never
 * change) and access the latest state via getState() at call time rather
 * than closing over stale state.
 *
 * Navigation-only transitions update only the NavigationStore so that form
 * subscribers (action footer, form body) are NOT woken up unnecessarily.
 */
export function useCreateProductSubscriberActions() {
  const navStore = useContext(NavigationSubscriberContext);
  const formStore = useContext(FormSubscriberContext);

  if (!navStore || !formStore)
    throw new Error(
      "useCreateProductSubscriberActions must be used within CreateProductSubscriberProvider",
    );

  return useMemo(
    () => ({
      /** Mark a wizard step as completed (idempotent) */
      handleCompleteStep: (stepId: WorkflowStep) => {
        const state = navStore.getState();
        if (state.completedSteps.includes(stepId)) return;
        navStore.setState({
          ...state,
          completedSteps: [...state.completedSteps, stepId],
        });
      },

      /** Set current internal step directly */
      handleSetCurrentStep: (step: WorkflowStep) => {
        navStore.setState({ ...navStore.getState(), currentStep: step });
      },

      /** Handle form submission — start generation process */
      handleFormSubmit: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "generating" });
        formStore.setState({
          ...formStore.getState(),
          isGenerating: true,
          selectedTshirt: null,
          selectedColor: null,
          selectedSize: null,
          generatedResult: null,
          generationError: null,
          createdProduct: null,
        });
      },

      /** Handle generation start */
      handleGenerationStart: () => {
        formStore.setState({
          ...formStore.getState(),
          isGenerating: true,
          generationError: null,
        });
      },

      /** Handle successful image generation */
      handleGenerationSuccess: (result: IImageGenerationResult) => {
        navStore.setState({ ...navStore.getState(), currentStep: "results" });
        formStore.setState({
          ...formStore.getState(),
          isGenerating: false,
          generatedResult: result,
        });
      },

      /** Handle image generation error */
      handleGenerationError: (error: Error) => {
        navStore.setState({ ...navStore.getState(), currentStep: "upload" });
        formStore.setState({
          ...formStore.getState(),
          isGenerating: false,
          generationError: error,
        });
      },

      /** Handle "Use this image" click — transition to fabric selection */
      handleUseImage: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "fabric" });
        formStore.setState({
          ...formStore.getState(),
          selectedTshirt: null,
          selectedColor: null,
          selectedSize: null,
        });
      },

      /** Handle back to results from customizer */
      handleBackToResults: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "results" });
      },

      /** Handle t-shirt selection — stay on fabric step */
      handleTshirtSelect: (tshirt: TshirtType | null) => {
        formStore.setState({
          ...formStore.getState(),
          selectedTshirt: tshirt,
          selectedColor: null,
          selectedSize: null,
        });
      },

      /** Handle color selection */
      handleColorSelect: (color: string | null) => {
        formStore.setState({ ...formStore.getState(), selectedColor: color });
      },

      /** Handle size selection */
      handleSizeSelect: (size: string | null) => {
        formStore.setState({ ...formStore.getState(), selectedSize: size });
      },

      /** Handle product creation start */
      handleProductCreationStart: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "creating" });
        formStore.setState({ ...formStore.getState(), isCreatingProduct: true });
      },

      /** Handle successful product creation */
      handleProductCreationSuccess: (product: CreatedProductT) => {
        navStore.setState({ ...navStore.getState(), currentStep: "sizing" });
        formStore.setState({
          ...formStore.getState(),
          isCreatingProduct: false,
          createdProduct: product,
        });
      },

      /** Handle product creation error */
      handleProductCreationError: () => {
        formStore.setState({ ...formStore.getState(), isCreatingProduct: false });
      },

      /** Handle moving to synthesis step (after upload) */
      handleMoveToSynthesis: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "synthesis" });
      },

      /** Handle moving to review step (from results) */
      handleMoveToReview: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "review" });
      },

      /** Handle going back to synthesis (from review to revise artwork) */
      handleBackToSynthesis: () => {
        navStore.setState({ ...navStore.getState(), currentStep: "synthesis" });
        formStore.setState({ ...formStore.getState(), generatedResult: null });
      },

      /** Handle image removal from form */
      handleRemoveImage: () => {
        const formState = formStore.getState();
        if (formState.form) {
          formState.form.setValue("image", undefined as any);
        }
        navStore.setState({ ...navStore.getState(), currentStep: "upload" });
        formStore.setState({ ...formState, uploadedImage: null });
      },

      /** Reset to initial state */
      handleReset: () => {
        const formState = formStore.getState();
        if (formState.form) {
          formState.form.reset();
        }
        navStore.setState({ currentStep: "upload", completedSteps: [] });
        formStore.setState({
          ...formState,
          isGenerating: false,
          generatedResult: null,
          generationError: null,
          selectedTshirt: null,
          selectedColor: null,
          selectedSize: null,
          isCreatingProduct: false,
          createdProduct: null,
          uploadedImage: null,
          prompt: "",
        });
      },

      /** Handle direct step navigation (from sidebar / mobile nav) */
      handleSetStep: (
        step: "upload" | "synthesis" | "review" | "fabric" | "sizing",
      ) => {
        const formState = formStore.getState();
        const stepMap: Record<typeof step, WorkflowStep> = {
          upload: "upload",
          synthesis: "synthesis",
          review: formState.generatedResult ? "results" : "review",
          fabric: "fabric",
          sizing: "sizing",
        };
        navStore.setState({
          ...navStore.getState(),
          currentStep: stepMap[step],
        });

        if (step === "fabric") {
          formStore.setState({
            ...formState,
            selectedTshirt: null,
            selectedColor: null,
            selectedSize: null,
          });
        }
      },
    }),
    [navStore, formStore],
  );
}
