"use client";

import { UseFormReturn, FieldError } from "react-hook-form";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { theme } from "@/theme";
import clsx from "clsx";
import ImageUploader from "../../dashboard/uploadImage/ImageUploader";
import StepIndicator from "../../ui/step-indicator";
import { useImageUploadField } from "./useImageUploadField";

interface IImageUploadFieldProps {
  form: UseFormReturn<IImageGenerationForm>;
  onRemoveImage: () => void;
  error?: FieldError;
}

const ImageUploadField = ({
  form,
  onRemoveImage,
  error,
}: IImageUploadFieldProps) => {
  const { uploadedImage, handleImageUpload } = useImageUploadField({
    form,
    error,
  });

  return (
    <article
      className={clsx(
        theme.upload.section,
        theme.animations.slideInLeft,
        "transition-all duration-500"
      )}
    >
      <div
        className={clsx(theme.upload.card, "transition-all duration-700", {
          "ring-2 ring-green-200 bg-linear-to-br from-green-50/20 via-white to-purple-50/30":
            uploadedImage,
        })}
      >
        <StepIndicator
          stepNumber="1"
          title="Upload Your Canvas"
          isCompleted={!!uploadedImage}
        />

        <ImageUploader
          onImageUpload={handleImageUpload}
          uploadedImage={uploadedImage}
          onRemoveImage={onRemoveImage}
        />
      </div>
    </article>
  );
};

export default ImageUploadField;
