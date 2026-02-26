import { useEffect } from "react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { IProductCreateForm } from "@/schemas/productCreateSchema";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UseImageUploadFieldProps {
  form: UseFormReturn<IProductCreateForm>;
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