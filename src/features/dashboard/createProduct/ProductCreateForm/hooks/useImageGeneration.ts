import { useMutation } from "@tanstack/react-query";
import { IImageGenerationResult, IProductCreateForm } from "@/schemas/productCreateSchema";
import { ImageGenerationService } from "@/services/imageGenerationService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useImageGeneration() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<IImageGenerationResult, Error, IProductCreateForm>({
    mutationFn: async (data) => {
      // In React Query v5, automatic cancellation is handled internally
      // No need to manually pass the signal
      return await ImageGenerationService.generateImage(data);
    },
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