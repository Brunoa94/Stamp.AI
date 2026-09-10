import type {
  IImageGenerationResult,
  IProductCreateForm,
} from "@/schemas/productCreateSchema";

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

export interface ImageGenerationRequestPayload extends IProductCreateForm {
  selectedStyle?: string;
  preservation?: number;
  removeBackground?: boolean;
}

export class ImageGenerationServiceMapper {
  /**
   * Map product create form to FormData for API request
   */
  static mapFormDataToRequest(data: ImageGenerationRequestPayload): FormData {
    const formData = new FormData();
    formData.append("prompt", data.prompt);
    formData.append("image", data.image);

    if (data.selectedStyle) {
      formData.append("selectedStyle", data.selectedStyle);
    }

    if (typeof data.preservation === "number") {
      formData.append("preservation", String(data.preservation));
    }

    if (typeof data.removeBackground === "boolean") {
      formData.append("removeBackground", String(data.removeBackground));
    }

    return formData;
  }

  /**
   * Map API response to IImageGenerationResult
   */
  static mapResponseToResult(
    response: ImageGenerationResponse,
  ): IImageGenerationResult {
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
