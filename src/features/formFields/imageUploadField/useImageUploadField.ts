import { useEffect } from "react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { IImageGenerationForm } from "@/schemas/imageGenerationSchema";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UseImageUploadFieldProps {
  form: UseFormReturn<IImageGenerationForm>;
  error?: FieldError;
}

export function useImageUploadField({ form, error }: UseImageUploadFieldProps) {
  const { setValue, watch } = form;
  const uploadedImage = watch("image");
  const { handleError } = useErrorHandler();

  const handleImageUpload = (file: File) => {
    setValue("image", file, { shouldValidate: true });
  };

  useEffect(() => {
    if (error?.message) {
      handleError({
        message: error.message,
        error: "IMAGE_REQUIRED",
      });
    }
  }, [error, handleError]);

  return {
    uploadedImage,
    handleImageUpload,
  };
}