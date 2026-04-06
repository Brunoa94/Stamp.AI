import { BaseSyntheticEvent, useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IProductCreateForm } from "@/schemas/productCreateSchema";
import { useAddToCart, useImageGeneration } from "@/queries";
import { mapCreateProductToCartInput } from "@/mappers/createProductToCartMapper";
import { STEP_CONFIG } from "../constants/stepConfig";
import { useProductCreation } from "./useProductCreation";
import { getVisibleSections } from "../utils/stepHelpers";
import { useCreateProductSubscriberActions } from "../context/actions";
import { CreateProductSelectors } from "../context/selectors";

interface UseWizardProductFormHandlersParams {
  form: UseFormReturn<IProductCreateForm> | null;
}

export function useWizardProductFormHandlers({
  form,
}: UseWizardProductFormHandlersParams) {
  const router = useRouter();
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Selectors
  const currentStep = CreateProductSelectors.currentStep();
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const selectedStyle = CreateProductSelectors.selectedStyle();
  const preservation = CreateProductSelectors.preservation();
  const generatedResult = CreateProductSelectors.generatedResult();
  const createdProduct = CreateProductSelectors.createdProduct();

  // Actions
  const {
    handleFormSubmit,
    handleGenerationSuccess,
    handleGenerationError,
    handleMoveToSynthesis,
    handleSetCurrentStep,
    handleBackToResults,
  } = useCreateProductSubscriberActions();

  // Mutations
  const { mutate: generateImage } = useImageGeneration();
  const addToCart = useAddToCart();

  // Custom hooks
  const { handleCreateProduct } = useProductCreation();

  const firstEnabledVariant = useMemo(
    () =>
      createdProduct?.variants?.find((variant) => variant.is_enabled) ||
      createdProduct?.variants?.[0],
    [createdProduct?.variants],
  );

  const variantPrice = firstEnabledVariant?.price || 25.0;
  const mockupImageUrl = createdProduct?.images?.[0]?.src || generatedResult?.imageUrl;

  const addToCartPayload = useMemo(
    () =>
      createdProduct
        ? mapCreateProductToCartInput({
            productId: createdProduct.id,
            productTitle: createdProduct.title,
            variantPrice,
            imageUrl: generatedResult?.imageUrl,
            variantId: firstEnabledVariant?.id,
          })
        : null,
    [
      createdProduct,
      firstEnabledVariant?.id,
      generatedResult?.imageUrl,
      variantPrice,
    ],
  );

  const addToCartMutation = useCallback((redirectAfterAdd: boolean) => {
    if (!addToCartPayload) return;

    addToCart.mutate(addToCartPayload, {
      onSuccess: () => {
        setIsAddedToCart(true);

        if (redirectAfterAdd) {
          toast.success("Added to cart", {
            description: "Redirecting to checkout...",
          });
          setTimeout(() => {
            router.push("/cart");
          }, 1000);
          return;
        }

        toast.success("Added to cart", {
          description: "Your custom design has been added to your cart.",
        });
      },
      onError: (error) => {
        toast.error("Failed to add to cart", {
          description: error.message,
        });
      },
    });
  }, [addToCart, addToCartPayload, router]);

  const onSubmit = useCallback((data: IProductCreateForm, event?: BaseSyntheticEvent) => {
    if (currentStep === "sizing") {
      const submitter = (event?.nativeEvent as SubmitEvent | undefined)
        ?.submitter as HTMLButtonElement | undefined;
      const submitAction = submitter?.value;

      if (submitAction === "add_to_cart") {
        addToCartMutation(false);
        return;
      }

      if (submitAction === "proceed_to_checkout") {
        if (!isAddedToCart) {
          addToCartMutation(true);
        } else {
          router.push("/cart");
        }
      }

      return;
    }

    handleFormSubmit();

    const payload = {
      ...data,
      selectedStyle,
      preservation,
    };

    generateImage(payload, {
      onSuccess: (result) => {
        handleGenerationSuccess(result);
      },
      onError: (error) => {
        if (error.message.includes("402")) {
          toast.error("No coins left", {
            description: "You have no coins left. Resets tomorrow.",
            duration: 5000,
            position: "top-right",
          });
        }
        handleGenerationError(error);
      },
    });
  }, [
    addToCartMutation,
    currentStep,
    form,
    generateImage,
    handleFormSubmit,
    handleGenerationError,
    handleGenerationSuccess,
    isAddedToCart,
    preservation,
    router,
    selectedStyle,
  ]);

  const stepConfig =
    STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG] || STEP_CONFIG.upload;
  const sections = getVisibleSections(currentStep);

  const formSubmitHandler = useMemo(
    () => form?.handleSubmit(onSubmit),
    [form, onSubmit],
  );

  const scrollToWizard = useCallback((delay = 0) => {
    const run = () => {
      // Reset the internal scroll container immediately (instant) so the new
      // step content always starts at the top, regardless of where the previous
      // step had scrolled it (e.g. the "scroll to continue button" on upload).
      const scrollContainer = document.querySelector(
        "[data-wizard-scroll-container='true']",
      ) as HTMLElement | null;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "instant" });
      }

      // Scroll the window after the next paint so React has had a chance to
      // commit the new step's layout before we calculate the target position.
      window.requestAnimationFrame(() => {
        const pipeline = document.getElementById("design-pipeline");
        if (!pipeline) return;

        const targetTop =
          pipeline.getBoundingClientRect().top + window.scrollY - 120;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth",
        });
      });
    };

    if (delay > 0) {
      window.setTimeout(run, delay);
      return;
    }

    run();
  }, []);

  const handleContinue = useCallback(() => {
    if (sections.isUploadStep) {
      handleMoveToSynthesis();
      scrollToWizard();
      return;
    }

    if (sections.isSynthesisStep) {
      formSubmitHandler?.();
      scrollToWizard();
      return;
    }

    if (currentStep === "fabric") {
      handleCreateProduct(generatedResult, selectedTshirt);
      scrollToWizard();
    }
  }, [
    currentStep,
    formSubmitHandler,
    generatedResult,
    handleCreateProduct,
    handleMoveToSynthesis,
    scrollToWizard,
    sections.isSynthesisStep,
    sections.isUploadStep,
    selectedTshirt,
  ]);

  const handleBack = useCallback(() => {
    if (sections.isSynthesisStep || sections.isGeneratingStep) {
      handleSetCurrentStep("upload");
      scrollToWizard();
      return;
    }

    if (sections.showFabricSection || sections.showCustomizerSection) {
      handleBackToResults();
      scrollToWizard();
    }
  }, [
    handleBackToResults,
    handleSetCurrentStep,
    scrollToWizard,
    sections.isGeneratingStep,
    sections.isSynthesisStep,
    sections.showCustomizerSection,
    sections.showFabricSection,
  ]);

  return {
    stepConfig,
    sections,
    handleBack,
    handleContinue,
    formSubmitHandler,
    isAddedToCart,
    isAddToCartPending: addToCart.isPending,
    scrollToWizard
  };
}
