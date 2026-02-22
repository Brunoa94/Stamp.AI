"use client";

import { UseFormReturn, FieldError } from "react-hook-form";
import { theme } from "@/theme";
import clsx from "clsx";
import ImageUploader from "../../dashboard/uploadImage/ImageUploader";
import StepIndicator from "../../ui/step-indicator";
import { useImageUploadField } from "./useImageUploadField";
import { useCreateProductSubscriberActions } from "@/features/dashboard/createProduct/context/CreateProductContextSubscriber/actions";
import { IProductCreateForm } from "@/schemas/productCreateSchema";

interface IImageUploadFieldProps {
  form: UseFormReturn<IProductCreateForm>;
  error?: FieldError;
}

const ImageUploadField = ({ form, error }: IImageUploadFieldProps) => {
  const { uploadedImage, handleImageUpload } = useImageUploadField({
    form,
    error,
  });
  const { handleRemoveImage: onRemoveImage } =
    useCreateProductSubscriberActions();

  return (
    <article
      className={clsx(
        theme.upload.section,
        theme.animations.slideInLeft,
        "transition-all duration-500",
      )}
    >
      <div
        className={clsx(theme.upload.card, "transition-all duration-700", {
          "ring-2 ring-green-200 bg-linear-to-br from-green-50/20 via-white to-slate-50/30":
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
