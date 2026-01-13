import { IImageGenerationForm, IImageGenerationResult } from "@/schemas/imageGenerationSchema";

export class ImageGenerationService {
  static async generateImage(
    data: IImageGenerationForm,
    signal?: AbortSignal
  ): Promise<IImageGenerationResult> {
    try {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("image", data.image);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
        signal, // Pass abort signal to fetch
      });

      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = "Failed to generate image";

        try {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();

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