"use client";

import clsx from "clsx";
import { useState } from "react";
import { useImageGeneration } from "./useImageGeneration";
import useImageFormNavigation from "./useImageFormNavigation";
import { useImageGenerationForm } from "./useImageGenerationForm";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { componentThemes } from "@/theme/components";
import ProcessingSection from "../ProcessingSection/ProcessingSection";
import ResultsSection from "../ResultsSection/ResultsSection";
import PromptInputFieldAdapter from "@/features/formFields/promptInputField/PromptInputFieldAdapter";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";
import {
  TshirtSelection,
  TshirtType,
} from "@/features/dashboard/selectTshirt";
import { Button } from "@/features/ui/button";
import { theme } from "@/theme";

interface ImageGenerationFormProps {}

const ImageGenerationForm = ({}: ImageGenerationFormProps) => {
  const [selectedTshirt, setSelectedTshirt] = useState<TshirtType | null>(null);
  const {
    mutate: generateImage,
    isPending: isProcessing,
    data: generatedResult,
    error,
  } = useImageGeneration();
  const {
    processingRef,
    resultsRef,
    productCustomizerRef,
    handleFormSubmit,
    handleUseImage,
  } = useImageFormNavigation({
    isProcessing,
    generatedResult,
  });
  const { form, handleRemoveImage } = useImageGenerationForm();
  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const watchedImage = watch("image");
  const onSubmit = (data: IImageGenerationForm) => {
    handleFormSubmit();
    generateImage(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
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
        onUseImage={handleUseImage}
      />

      <section
        ref={productCustomizerRef}
        className="space-y-8 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
        aria-label="Product customizer"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-700 to-pink-700">
            Customize Your Product
          </h2>
          <p className="text-gray-600 mt-2">
            Select your t-shirt type and customize your order
          </p>
        </div>

        <div className="bg-transparent border-2 border-transparent bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg p-[2px] shadow-lg">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
            <TshirtSelection
              onTshirtSelect={setSelectedTshirt}
              selectedTshirt={selectedTshirt ?? undefined}
            />
          </div>
        </div>

        {selectedTshirt && (
          <div className="flex justify-center mt-8">
            <Button
              type="button"
              className={clsx(theme.button.submit.base, theme.button.submit.enabled, "px-12 animate-pulse")}
            >
              Stamp it! 🎨
            </Button>
          </div>
        )}
      </section>
    </form>
  );
};

export default ImageGenerationForm;
