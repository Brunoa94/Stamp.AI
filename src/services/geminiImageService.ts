import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiImageGenerationResult {
  imageUrl: string;
  enhancedPrompt: string;
}

/**
 * Google Gemini Image Generation Service
 *
 * Uses the official @google/generative-ai SDK with available models:
 * - gemini-2.0-flash for image analysis
 * - gemini-2.5-flash-image for image generation
 */
export class GeminiImageService {
  private static parseDataUrl(imageUrl: string): {
    mimeType: string;
    base64Data: string;
  } {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid data URL format");
    }

    return {
      mimeType: match[1],
      base64Data: match[2],
    };
  }

  private static async removeBackgroundFromDataUrl(
    imageUrl: string,
  ): Promise<string> {
    const { mimeType, base64Data } = this.parseDataUrl(imageUrl);

    const { removeBackground } = await import("@imgly/background-removal-node");

    const sourceBuffer = Buffer.from(base64Data, "base64");
    const normalizedMimeType = mimeType?.startsWith("image/")
      ? mimeType
      : "image/png";
    const sourceBlob = new Blob([sourceBuffer], { type: normalizedMimeType });

    let processedBlob: Blob;

    try {
      processedBlob = await removeBackground(sourceBlob, {
        model: "small",
        output: {
          format: "image/png",
          quality: 1,
        },
      });
    } catch {
      processedBlob = await removeBackground(imageUrl, {
        model: "small",
        output: {
          format: "image/png",
          quality: 1,
        },
      });
    }

    const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());
    return `data:image/png;base64,${processedBuffer.toString("base64")}`;
  }

  private static getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate an image using Google Gemini
   *
   * @param imageBuffer - The image file as ArrayBuffer
   * @param mimeType - The MIME type of the image (e.g., "image/jpeg")
   * @param prompt - The user's prompt describing the desired transformation
   * @returns Object containing the generated image URL (base64 data URL) and enhanced prompt
   */
  static async generateImage(
    imageBuffer: ArrayBuffer,
    mimeType: string,
    prompt: string
  ): Promise<GeminiImageGenerationResult> {
    const genAI = this.getClient();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Step 1: Use Gemini 2.5 Flash to analyze image and generate enhanced prompt
    console.log("Analyzing image with Gemini 2.5 Flash...");

    const analysisModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const analysisResult = await analysisModel.generateContent([
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      {
        text: `Analyze this image and create a detailed image generation prompt based on this description: "${prompt}".

Your task:
1. Identify key visual elements in the uploaded image (subject, colors, composition, style)
2. Transform these elements according to the user's requested style/theme: "${prompt}"
3. Create a detailed, vivid prompt that will generate a new image combining the original subject with the requested transformation

Adapt the image to be well printable on a t-shirt. Keep the subject scale at around 80% of the original image and use the uploaded image as the base reference.

Critical background rules (must be explicit in the prompt you output):
- Background must be fully transparent (alpha), not white and not gray.
- Do NOT include checkerboard, grid, tiles, pattern, texture, studio backdrop, or any scene background.
- Output only the isolated subject/logo artwork, centered.
- Clean silhouette edges for print production.

Output ONLY the image generation prompt, nothing else. Make it descriptive, specific, and optimized for AI image generation.`,
      },
    ]);

    const enhancedPrompt = analysisResult.response.text();

    if (!enhancedPrompt) {
      throw new Error("Failed to generate enhanced prompt from Gemini analysis");
    }

    console.log("Enhanced prompt generated:", enhancedPrompt.substring(0, 100) + "...");

    // Step 2: Generate new image using Gemini 2.5 Flash Image
    console.log("Generating image with Gemini 2.5 Flash Image...");

    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const generationPrompt = `${enhancedPrompt}\n\nNon-negotiable output constraints:\n- Return a PNG-style image with transparent alpha background.\n- No checkerboard/grid/pattern in the background.\n- No backdrop or environment; isolated subject only.\n- Keep clean cutout edges suitable for t-shirt printing.`;

    const imageResult = await imageModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: generationPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["image", "text"],
      } as any,
    });

    // Extract the generated image from the response
    const response = imageResult.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
      throw new Error("No image generated from Gemini");
    }

    // Find the image part in the response
    let generatedImageBase64: string | null = null;
    let generatedMimeType = "image/png";

    for (const part of parts) {
      if ("inlineData" in part && part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        generatedMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image data found in Gemini response");
    }

    if (!generatedMimeType.startsWith("image/")) {
      generatedMimeType = "image/png";
    }

    const imageUrl = `data:${generatedMimeType};base64,${generatedImageBase64}`;

    let transparentImageUrl = imageUrl;

    try {
      console.log("Removing generated image background with IMG.LY...");
      transparentImageUrl = await this.removeBackgroundFromDataUrl(imageUrl);
    } catch (backgroundRemovalError) {
      console.error("Background removal failed:", backgroundRemovalError);
      throw new Error(
        "Background removal failed. Please try generating again.",
      );
    }

    return {
      imageUrl: transparentImageUrl,
      enhancedPrompt,
    };
  }
}
