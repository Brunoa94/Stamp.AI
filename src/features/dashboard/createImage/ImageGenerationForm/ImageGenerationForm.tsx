"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { useImageGeneration } from "./hooks/useImageGeneration";
import useImageFormNavigation from "./hooks/useImageFormNavigation";
import { useImageGenerationForm } from "./hooks/useImageGenerationForm";
import { useCreateProductAndAddToCart } from "./hooks/useCreateCustomProduct";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { componentThemes } from "@/theme/components";
import ProcessingSection from "../ProcessingSection/ProcessingSection";
import ResultsSection from "../ResultsSection/ResultsSection";
import PromptInputFieldAdapter from "@/features/formFields/promptInputField/PromptInputFieldAdapter";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";
import { TshirtType } from "@/features/dashboard/selectTshirt";
import CreatedProductDisplay from "../components/CreatedProductDisplay";
import ProductCustomizerSection from "../ProductCustomizer/ProductCustomizerSection";
import { useUser } from "@/hooks/useAuth";

interface ImageGenerationFormProps {}

const ImageGenerationForm = ({}: ImageGenerationFormProps) => {
  const [selectedTshirt, setSelectedTshirt] = useState<TshirtType | null>(null);
  const [showCustomizerSection, setShowCustomizerSection] = useState(false);
  const { data: user } = useUser();

  const {
    mutate: generateImage,
    isPending: isProcessing,
    data: generatedResult,
    error,
  } = useImageGeneration();

  const { createAndAddToCart, isCreatingProduct, createdProduct } =
    useCreateProductAndAddToCart();

  const {
    processingRef,
    resultsRef,
    productCustomizerRef,
    createdProductRef,
    handleFormSubmit,
    handleUseImage,
  } = useImageFormNavigation({
    isProcessing,
    generatedResult,
    createdProduct,
  });

  const { form, handleRemoveImage } = useImageGenerationForm();
  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const watchedImage = watch("image");

  const handleUseImageClick = () => {
    setShowCustomizerSection(true);
    handleUseImage();
  };

  const handleBackToResults = () => {
    setShowCustomizerSection(false);
    // Keep selectedTshirt state when going back
  };

  const onSubmit = (data: IImageGenerationForm) => {
    setShowCustomizerSection(false);
    setSelectedTshirt(null);
    handleFormSubmit();
    generateImage(data);
  };

  const handleStampIt = async () => {
    if (!generatedResult?.imageUrl || !selectedTshirt || !user) {
      return;
    }

    createAndAddToCart({
      blueprintId: selectedTshirt.blueprint_id,
      printProviderId: selectedTshirt.print_provider_id,
      imageUrl: generatedResult.imageUrl,
      tshirtName: selectedTshirt.name,
      userId: user.id,
      userEmail: user.email,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {!showCustomizerSection && (
        <>
          <section
            className={clsx(componentThemes.container.grid)}
            aria-label="Image generation form"
          >
            <div className="upload-section">
              <ImageUploadField
                form={form}
                onRemoveImage={handleRemoveImage}
                error={errors.image}
              />
            </div>

            <div className="prompt-section">
              <PromptInputFieldAdapter
                form={form}
                uploadedImage={watchedImage}
                isProcessing={isProcessing}
                generatedResult={generatedResult || null}
                error={errors.prompt}
              />
            </div>
          </section>

          <ProcessingSection
            sectionRef={processingRef}
            isProcessing={isProcessing}
          />

          <ResultsSection
            ref={resultsRef}
            generatedResult={generatedResult || null}
            error={error?.message}
            onUseImage={handleUseImageClick}
          />
        </>
      )}

      {showCustomizerSection && generatedResult && !createdProduct && (
        <ProductCustomizerSection
          sectionRef={productCustomizerRef}
          selectedTshirt={selectedTshirt}
          onTshirtSelect={setSelectedTshirt}
          onStampIt={handleStampIt}
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

export default ImageGenerationForm;
