import type { IProductCreateForm, IImageGenerationResult } from "@/schemas/productCreateSchema";

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

export class ImageGenerationServiceMapper {
  /**
   * Map product create form to FormData for API request
   */
  static mapFormDataToRequest(data: IProductCreateForm): FormData {
    const formData = new FormData();
    formData.append("prompt", data.prompt);
    formData.append("image", data.image);
    return formData;
  }

  /**
   * Map API response to IImageGenerationResult
   */
  static mapResponseToResult(response: ImageGenerationResponse): IImageGenerationResult {
    return {
      imageUrl: response.imageUrl,
      enhancedPrompt: response.enhancedPrompt,
      originalPrompt: response.originalPrompt,
    };
  }

  /**
   * Validate response has required fields
   */
  static validateResponse(response: ImageGenerationResponse): boolean {
    return !!(
      response.success &&
      response.imageUrl &&
      response.enhancedPrompt &&
      response.originalPrompt
    );
  }
}
