"use client";

import clsx from "clsx";
import { useEffect } from "react";
import { componentThemes } from "@/theme/components";
import PromptInputFieldAdapter from "@/features/formFields/promptInputField/PromptInputFieldAdapter";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";
import dynamic from "next/dynamic";

import { useCreateProductNavigation } from "../hooks/useCreateProductNavigation";
import { IProductCreateForm } from "@/schemas/productCreateSchema";
import { useImageGeneration } from "@/queries";
import { CreateProductSelectors } from "../context/CreateProductContextSubscriber/selectors";
import { useCreateProductSubscriberActions } from "../context/CreateProductContextSubscriber/actions";

const ProcessingSection = dynamic(
  () => import("../ProcessingSection/ProcessingSection"),
  { ssr: false },
);

const ResultsSection = dynamic(
  () => import("../ProductCustomizer/ResultsSection"),
  { ssr: false },
);

const ProductCustomizerSection = dynamic(
  () => import("../ProductCustomizer/ProductCustomizerSection"),
  { ssr: false },
);

const CreatedProductDisplay = dynamic(
  () => import("../components/CreatedProductDisplay"),
  { ssr: false },
);

const ProductCreateForm = () => {
  // Selectors - only what's needed at this level
  const currentStep = CreateProductSelectors.currentStep();
  const form = CreateProductSelectors.form();
  const uploadedImage = CreateProductSelectors.uploadedImage();
  const isGenerating = CreateProductSelectors.isGenerating();
  const createdProduct = CreateProductSelectors.createdProduct();

  // Actions - only what's needed at this level
  const {
    handleFormSubmit,
    handleGenerationStart,
    handleGenerationSuccess,
    handleGenerationError,
  } = useCreateProductSubscriberActions();

  // Navigation and scrolling
  const {
    processingRef,
    resultsRef,
    productCustomizerRef,
    createdProductRef,
    scrollToProcessing,
  } = useCreateProductNavigation();

  // Image generation mutation
  const { mutate: generateImage, isPending: isGeneratingMutation } =
    useImageGeneration();

  // Sync mutation states with context
  useEffect(() => {
    if (isGeneratingMutation && !isGenerating) {
      handleGenerationStart();
    }
  }, [isGeneratingMutation, isGenerating, handleGenerationStart]);

  // Early return if form is not initialized yet - AFTER all hooks
  if (!form) {
    return null;
  }

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: IProductCreateForm) => {
    handleFormSubmit();
    scrollToProcessing();

    generateImage(data, {
      onSuccess: (result) => {
        handleGenerationSuccess(result);
      },
      onError: (error) => {
        handleGenerationError(error);
      },
    });
  };

  const showCustomizerSection = currentStep === "customizing";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {!showCustomizerSection && (
        <>
          <section
            className={clsx(componentThemes.container.grid)}
            aria-label="Image generation form"
          >
            <div className="upload-section">
              <ImageUploadField form={form} error={errors.image} />
            </div>

            <div className="prompt-section">
              <PromptInputFieldAdapter
                form={form}
                uploadedImage={uploadedImage || undefined}
                isProcessing={isGenerating}
                error={errors.prompt}
              />
            </div>
          </section>

          <ProcessingSection sectionRef={processingRef} />

          <ResultsSection ref={resultsRef} />
        </>
      )}

      {showCustomizerSection && !createdProduct && (
        <ProductCustomizerSection sectionRef={productCustomizerRef} />
      )}

      {createdProduct && (
        <section className="mt-8">
          <CreatedProductDisplay />
        </section>
      )}
    </form>
  );
};

export default ProductCreateForm;
