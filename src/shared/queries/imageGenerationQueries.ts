import { useMutation } from "@tanstack/react-query";
import { IImageGenerationResult } from "@/shared/schemas/productCreateSchema";
import { ImageGenerationService } from "@/shared/services/imageGenerationService";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import type { ImageGenerationRequestPayload } from "@/shared/mappers/services/imageGenerationServiceMapper";

/**
 * Generate AI image from form data
 */
export function useImageGeneration() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    IImageGenerationResult,
    Error,
    ImageGenerationRequestPayload
  >({
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
    },
  });
}
