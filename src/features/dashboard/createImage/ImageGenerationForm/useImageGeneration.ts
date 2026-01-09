import { useMutation } from "@tanstack/react-query";
import { IImageGenerationForm, IImageGenerationResult } from "@/schemas/imageGenerationSchema";
import { ImageGenerationService } from "@/services/imageGenerationService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useImageGeneration() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<IImageGenerationResult, Error, IImageGenerationForm>({
    mutationFn: ImageGenerationService.generateImage,
    onSuccess: (data) => {
      handleSuccess("Image generated successfully!");
      return data;
    },
    onError: (error) => {
      handleError(error);
      throw error;
    },
  });
}