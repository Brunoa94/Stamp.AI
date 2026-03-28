import { BaseSyntheticEvent, useState } from "react";
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
import useScrollToSection from "@/hooks/useScrollToSection";

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
  const { smoothScrollToElementById } = useScrollToSection();

  const firstEnabledVariant =
    createdProduct?.variants?.find((v) => v.is_enabled) ||
    createdProduct?.variants?.[0];
  const variantPrice = firstEnabledVariant?.price || 25.0;

  const addToCartPayload = createdProduct
    ? mapCreateProductToCartInput({
        productId: createdProduct.id,
        productTitle: createdProduct.title,
        variantPrice,
        imageUrl: generatedResult?.imageUrl,
        variantId: firstEnabledVariant?.id,
      })
    : null;

  const addToCartMutation = (redirectAfterAdd: boolean) => {
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
  };

  const onSubmit = (data: IProductCreateForm, event?: BaseSyntheticEvent) => {
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

    generateImage(data, {
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
  };

  const stepConfig =
    STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG] || STEP_CONFIG.upload;
  const sections = getVisibleSections(currentStep);

  const formSubmitHandler = form?.handleSubmit(onSubmit);

  const handleContinue = () => {
    if (sections.isUploadStep) {
      handleMoveToSynthesis();
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
      return;
    }

    if (sections.isSynthesisStep) {
      formSubmitHandler?.();
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
      return;
    }

    if (currentStep === "fabric") {
      handleCreateProduct(generatedResult, selectedTshirt);
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
    }
  };

  const handleBack = () => {
    if (sections.isSynthesisStep || sections.isGeneratingStep) {
      handleSetCurrentStep("upload");
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
      return;
    }

    if (sections.showFabricSection || sections.showCustomizerSection) {
      handleBackToResults();
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
    }
  };

  return {
    stepConfig,
    sections,
    handleBack,
    handleContinue,
    formSubmitHandler,
    isAddedToCart,
    isAddToCartPending: addToCart.isPending,
  };
}
