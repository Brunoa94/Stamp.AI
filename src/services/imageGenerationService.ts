import { IImageGenerationResult } from "@/schemas/productCreateSchema";
import { ImageGenerationResponseSchema } from "@/schemas/services";
import {
  ImageGenerationServiceMapper,
  type ImageGenerationRequestPayload,
} from "@/mappers/services";
import { POST } from "./apiClient";
import { z } from "zod";
import { ErrorClient } from "./errorClient";

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

export class ImageGenerationService {
  static async generateImage(
    data: ImageGenerationRequestPayload,
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
      throw ErrorClient.handleError({error, service: "Image Generation", action: "Generate Image"})
    }
  }
}