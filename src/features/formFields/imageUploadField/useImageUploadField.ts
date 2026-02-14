import { useEffect } from "react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { IImageGenerationForm } from "@/schemas/productCreateSchema";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UseImageUploadFieldProps {
  form: UseFormReturn<IImageGenerationForm>;
  error?: FieldError;
}

export function useImageUploadField({ form, error }: UseImageUploadFieldProps) {
  const { setValue, watch } = form;
  const uploadedImage = watch("image");
  
  const handleImageUpload = (file: File) => {
    setValue("image", file, { shouldValidate: true });
  };

  return {
    uploadedImage,
    handleImageUpload,
  };
}