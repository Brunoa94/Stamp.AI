import { IProductCreateForm, IImageGenerationResult } from "@/schemas/productCreateSchema";
import { ImageGenerationResponseSchema } from "@/schemas/services";
import { ImageGenerationServiceMapper } from "@/mappers/services";
import { POST } from "./apiClient";
import { z } from "zod";

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

export class ImageGenerationService {
  static async generateImage(
    data: IProductCreateForm,
  ): Promise<IImageGenerationResult> {
    try {
      // Use mapper to create FormData
      const formData = ImageGenerationServiceMapper.mapFormDataToRequest(data);

      const result = await POST<ImageGenerationResponse>(
        "/api/generate-image",
        formData,
      );

      // Validate API response
      const validatedResponse = ImageGenerationResponseSchema.parse(result);

      if (!validatedResponse.success) {
        throw new Error("Image generation was not successful");
      }

      // Use mapper to convert response to result
      return ImageGenerationServiceMapper.mapResponseToResult(validatedResponse);
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        throw new Error(`Image generation response validation failed: ${error.message}`);
      }

      // Handle network errors, parsing errors, and other exceptions
      if (error instanceof Error) {
        // Re-throw known errors with context
        throw new Error(`Image generation failed: ${error.message}`);
      }

      // Handle unknown errors
      throw new Error("Image generation failed: Unknown error occurred");
    }
  }
}