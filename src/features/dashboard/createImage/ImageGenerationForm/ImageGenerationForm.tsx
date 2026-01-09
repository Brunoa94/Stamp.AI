"use client";

import clsx from "clsx";
import { useImageGeneration } from "./useImageGeneration";
import useImageFormNavigation from "./useImageFormNavigation";
import { useImageGenerationForm } from "./useImageGenerationForm";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { componentThemes } from "@/theme/components";
import ProcessingSection from "../ProcessingSection/ProcessingSection";
import ResultsSection from "../ResultsSection/ResultsSection";
import PromptInputField from "@/features/formFields/promptInputField/PromptInputField";
import ImageUploadField from "@/features/formFields/imageUploadField/ImageUploadField";

interface ImageGenerationFormProps {}

const ImageGenerationForm = ({}: ImageGenerationFormProps) => {
  const {
    mutate: generateImage,
    isPending: isProcessing,
    data: generatedResult,
    error,
  } = useImageGeneration();
  const { processingRef, resultsRef, handleFormSubmit } =
    useImageFormNavigation({
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
          <PromptInputField
            form={form}
            uploadedImage={watchedImage}
            isProcessing={isProcessing}
            generatedResult={generatedResult || null}
            error={errors.prompt}
          />
        </div>
      </section>

      <ProcessingSection sectionRef={processingRef} isProcessing={isProcessing} />

      <ResultsSection
        ref={resultsRef}
        generatedResult={generatedResult || null}
        error={error?.message}
      />
    </form>
  );
};

export default ImageGenerationForm;
