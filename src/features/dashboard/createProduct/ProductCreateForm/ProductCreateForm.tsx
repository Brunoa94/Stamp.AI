"use client";

import clsx from "clsx";
import { useEffect } from "react";
import { componentThemes } from "@/theme/components";
import PromptInputFieldAdapter from "@/features/formFields/promptInputField/PromptInputFieldAdapter";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";
import dynamic from "next/dynamic";
import {
  CreateProductSelectors,
  useCreateProductSubscriberActions,
} from "../context/CreateProductContextSubscriber";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useCreateProductNavigation } from "../hooks/useCreateProductNavigation";
import { IProductCreateForm } from "@/schemas/productCreateSchema";

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
  // Selectors - subscribe to specific state slices
  const currentStep = CreateProductSelectors.currentStep();
  const form = CreateProductSelectors.form();
  const uploadedImage = CreateProductSelectors.uploadedImage();
  const isGenerating = CreateProductSelectors.isGenerating();
  const generatedResult = CreateProductSelectors.generatedResult();
  const generationError = CreateProductSelectors.generationError();
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const isCreatingProduct = CreateProductSelectors.isCreatingProduct();
  const createdProduct = CreateProductSelectors.createdProduct();

  // Actions - get action handlers
  const {
    handleFormSubmit,
    handleGenerationStart,
    handleGenerationSuccess,
    handleGenerationError,
    handleUseImage,
    handleBackToResults,
  } = useCreateProductSubscriberActions();

  // Navigation and scrolling
  const {
    processingRef,
    resultsRef,
    productCustomizerRef,
    createdProductRef,
    scrollToProcessing,
    scrollToCustomizer,
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

  const onUseImageClick = () => {
    handleUseImage();
    scrollToCustomizer();
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
                generatedResult={generatedResult || null}
                error={errors.prompt}
              />
            </div>
          </section>

          <ProcessingSection
            sectionRef={processingRef}
            isProcessing={isGenerating}
          />

          <ResultsSection
            ref={resultsRef}
            generatedResult={generatedResult || null}
            error={generationError?.message}
            onUseImage={onUseImageClick}
          />
        </>
      )}

      {showCustomizerSection && generatedResult && !createdProduct && (
        <ProductCustomizerSection
          sectionRef={productCustomizerRef}
          selectedTshirt={selectedTshirt}
          onBack={handleBackToResults}
          isCreatingProduct={isCreatingProduct}
        />
      )}

      {createdProduct && (
        <section className="mt-8">
          <div ref={createdProductRef}>
            <CreatedProductDisplay
              product={createdProduct}
              generatedImageUrl={generatedResult?.imageUrl}
              cartMode={true}
            />
          </div>
        </section>
      )}
    </form>
  );
};

export default ProductCreateForm;
