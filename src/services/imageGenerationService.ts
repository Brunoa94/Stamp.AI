import { IProductCreateForm, IImageGenerationResult } from "@/schemas/productCreateSchema";
import { POST } from "./apiClient";

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

export class ImageGenerationService {
  static async generateImage(
    data: IProductCreateForm,
    signal?: AbortSignal
  ): Promise<IImageGenerationResult> {
    try {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("image", data.image);

      const result = await POST<ImageGenerationResponse>(
        "/api/generate-image",
        formData,
        { signal }
      );

      if (!result.success) {
        throw new Error("Image generation was not successful");
      }

      return {
        imageUrl: result.imageUrl,
        enhancedPrompt: result.enhancedPrompt,
        originalPrompt: result.originalPrompt,
      };
    } catch (error) {
      // Handle abort errors (user cancelled the request)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Image generation was cancelled");
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