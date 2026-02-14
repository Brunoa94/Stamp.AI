import { UseFormReturn, FieldError } from "react-hook-form";
import {
  IImageGenerationForm,
  IImageGenerationResult,
} from "@/schemas/productCreateSchema";
import {
  getWordCount,
  isWordCountOverLimit,
  canSubmitForm,
} from "@/utils/formUtils";

interface UsePromptInputFieldProps {
  form: UseFormReturn<IImageGenerationForm>;
  uploadedImage: File | undefined;
  isProcessing: boolean;
  generatedResult: IImageGenerationResult | null;
  error?: FieldError;
}

export function usePromptInputField({
  form,
  uploadedImage,
  isProcessing,
  generatedResult,
  error,
}: UsePromptInputFieldProps) {
  const { register, watch } = form;
  const prompt = watch("prompt");

  const wordCount = getWordCount(prompt);
  const isOverLimit = isWordCountOverLimit(wordCount);
  const canSubmit = canSubmitForm(
    !!uploadedImage,
    prompt,
    wordCount,
    isProcessing
  );

  return {
    register,
    prompt,
    wordCount,
    isOverLimit,
    canSubmit,
    error,
  };
}