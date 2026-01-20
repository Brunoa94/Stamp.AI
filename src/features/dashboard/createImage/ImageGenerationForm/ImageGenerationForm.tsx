"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { useImageGeneration } from "./useImageGeneration";
import useImageFormNavigation from "./useImageFormNavigation";
import { useImageGenerationForm } from "./useImageGenerationForm";
import { useCreateCustomProduct } from "./useCreateCustomProduct";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { componentThemes } from "@/theme/components";
import ProcessingSection from "../ProcessingSection/ProcessingSection";
import ResultsSection from "../ResultsSection/ResultsSection";
import PromptInputFieldAdapter from "@/features/formFields/promptInputField/PromptInputFieldAdapter";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";
import { TshirtType } from "@/features/dashboard/selectTshirt";
import CreatedProductDisplay from "../components/CreatedProductDisplay";
import ProductCustomizerSection from "../components/ProductCustomizerSection";
import useCreateOrder from "./useCreateOrder";
import { useUser } from "@/hooks/useAuth";
import { useOrderPayload } from "./useOrderPayload";

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
  const {
    mutate: createProduct,
    isPending: isCreatingProduct,
    isSuccess: isProductCreated,
    data: createdProduct,
  } = useCreateCustomProduct();

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
  const {
    mutateAsync: createOrder,
    isSuccess: isOrderCreated,
    data: createdOrder,
  } = useCreateOrder();
  const orderPayload = useOrderPayload();
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

    // Step 1: Create product in Printify
    createProduct({
      blueprint_id: selectedTshirt.blueprint_id,
      print_provider_id: selectedTshirt.print_provider_id,
      image_url: generatedResult.imageUrl,
      title: `${selectedTshirt.name} - Custom Design`,
      description: `Custom designed ${selectedTshirt.name} with your unique artwork`,
      user_id: user.id,
      customer_email: user.email,
    });
  };

  // Step 2: Create order after product is successfully created
  useEffect(() => {
    if (
      isProductCreated &&
      createdProduct &&
      selectedTshirt &&
      user &&
      generatedResult
    ) {
      const payload = orderPayload.create({
        user,
        selectedTshirt,
        generatedImageUrl: generatedResult.imageUrl,
        productImageUrl: createdProduct.images?.[0]?.src,
        productId: createdProduct.id,
      });

      createOrder(payload);
    }
  }, [isProductCreated]);

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
              orderId={createdOrder?.id}
            />
          </div>
        </section>
      )}
    </form>
  );
};

export default ImageGenerationForm;
