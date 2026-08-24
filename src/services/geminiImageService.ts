import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

interface GeminiImageGenerationResult {
  imageUrl: string;
  enhancedPrompt: string;
}

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

// Use mock image in development, real Gemini API in production
const USE_MOCK_IMAGE = process.env.NODE_ENV !== "production";

/**
 * Google Gemini Image Generation Service
 *
 * Uses Gemini 2.5 Flash for prompt enhancement and image generation
 */
export class GeminiImageService {
  private static getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Preprocess image to ensure compatibility with Gemini API
   * Uses sharp if available, otherwise returns base64 directly
   */
  private static async preprocessImage(
    imageBuffer: ArrayBuffer,
  ): Promise<{ base64: string; mimeType: string }> {
    try {
      // Try to use sharp for image processing
      const sharp = (await import("sharp")).default;

      let sharpInstance = sharp(Buffer.from(imageBuffer));
      const metadata = await sharpInstance.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const MAX_IMAGE_DIMENSION = 2048;

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        sharpInstance = sharpInstance.resize(
          MAX_IMAGE_DIMENSION,
          MAX_IMAGE_DIMENSION,
          {
            fit: "inside",
            withoutEnlargement: true,
          },
        );
      }

      let quality = 90;
      let outputBuffer = await sharpInstance.jpeg({ quality }).toBuffer();

      while (outputBuffer.byteLength > MAX_IMAGE_SIZE_BYTES && quality > 50) {
        quality -= 10;
        outputBuffer = await sharp(Buffer.from(imageBuffer))
          .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toBuffer();
      }

      return {
        base64: outputBuffer.toString("base64"),
        mimeType: "image/jpeg",
      };
    } catch (error) {
      // Fallback: convert ArrayBuffer to base64 without processing
      console.warn("[GeminiImageService] Sharp not available, using raw image:", error);
      const buffer = Buffer.from(imageBuffer);

      // Detect mime type from magic bytes
      let mimeType = "image/jpeg";
      if (buffer[0] === 0x89 && buffer[1] === 0x50) {
        mimeType = "image/png";
      } else if (buffer[0] === 0x47 && buffer[1] === 0x49) {
        mimeType = "image/gif";
      }

      return {
        base64: buffer.toString("base64"),
        mimeType,
      };
    }
  }

  /**
   * Remove background from generated image with fallback
   * Returns original image if background removal fails
   */
  private static async removeBackgroundSafe(imageDataUrl: string): Promise<string> {
    try {
      const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        console.warn("[GeminiImageService] Invalid data URL format, skipping background removal");
        return imageDataUrl;
      }

      const { removeBackground } = await import("@imgly/background-removal-node");

      const sourceBuffer = Buffer.from(match[2], "base64");
      const sourceBlob = new Blob([sourceBuffer], {
        type: match[1] || "image/png",
      });

      const processedBlob = await removeBackground(sourceBlob, {
        model: "small",
        output: { format: "image/png", quality: 1 },
      });

      const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());
      return `data:image/png;base64,${processedBuffer.toString("base64")}`;
    } catch (error) {
      console.error("[GeminiImageService] Background removal failed, returning original image:", error);
      // Return the original image without background removal
      return imageDataUrl;
    }
  }

  /**
   * Get preservation instruction based on level (0-100)
   * 0 = low preservation (more creative freedom)
   * 100 = high preservation (stay close to original)
   */
  private static getPreservationInstruction(preservation: number): string {
    if (preservation >= 80) {
      return "CRITICAL: Preserve the original image as closely as possible. Keep the exact pose, composition, colors, and details. Only apply minimal stylistic changes while maintaining the subject's identity and appearance exactly as shown.";
    } else if (preservation >= 60) {
      return "Preserve the main subject's key features, pose, and overall composition. You may enhance colors and add stylistic elements, but keep the subject recognizable and similar to the original.";
    } else if (preservation >= 40) {
      return "Use the original image as a reference. Keep the general subject and concept, but feel free to reinterpret the style, colors, and composition creatively.";
    } else if (preservation >= 20) {
      return "Take creative liberties with the design. Use the original image as loose inspiration only. You may significantly change the style, pose, and details while keeping the basic subject concept.";
    } else {
      return "Maximum creative freedom. Use the original image only as a starting concept. Feel free to completely reimagine the subject with a new style, composition, and artistic interpretation.";
    }
  }

  /**
   * Get background instruction based on removeBackground flag
   */
  private static getBackgroundInstruction(removeBackground: boolean): string {
    if (removeBackground) {
      return "- Isolated subject on a solid white or transparent background, no shadows or environmental elements";
    }
    return "- Include the background as part of the design, keep environmental elements and context from the original image";
  }

  /**
   * Generate a mock image for testing (uses zoe.png from public folder)
   */
  private static async generateMockImage(
    prompt: string,
    removeBackground: boolean,
  ): Promise<GeminiImageGenerationResult> {
    console.log("[MOCK] Using mock image instead of Gemini API");
    console.log("[MOCK] Prompt:", prompt);
    console.log("[MOCK] Remove background:", removeBackground);

    // Read the mock image from public folder
    const mockImagePath = path.join(process.cwd(), "public", "zoe.png");
    const mockImageBuffer = fs.readFileSync(mockImagePath);
    const mockImageBase64 = mockImageBuffer.toString("base64");
    const imageUrl = `data:image/png;base64,${mockImageBase64}`;

    // Try background removal, fallback to original if it fails
    const transparentImageUrl = await this.removeBackgroundSafe(imageUrl);

    const mockEnhancedPrompt =
      `[MOCK] Enhanced prompt based on: "${prompt}" with removeBackground=${removeBackground}`;

    return {
      imageUrl: transparentImageUrl,
      enhancedPrompt: mockEnhancedPrompt,
    };
  }

  /**
   * Generate an image using Google Gemini
   * @param preservation - Level of preservation (0-100). Higher = stay closer to original image.
   * @param removeBackground - Whether to isolate subject (true) or keep background (false).
   */
  static async generateImage(
    imageBuffer: ArrayBuffer,
    _mimeType: string,
    prompt: string,
    preservation: number = 50,
    removeBackground: boolean = true,
  ): Promise<GeminiImageGenerationResult> {
    // Use mock image for testing
    if (USE_MOCK_IMAGE) {
      return this.generateMockImage(prompt, removeBackground);
    }

    const genAI = this.getClient();
    const processedImage = await this.preprocessImage(imageBuffer);
    const preservationInstruction = this.getPreservationInstruction(
      preservation,
    );
    const backgroundInstruction = this.getBackgroundInstruction(
      removeBackground,
    );

    // Step 1: Analyze image and generate enhanced prompt
    const analysisModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const analysisResult = await analysisModel.generateContent([
      {
        inlineData: {
          mimeType: processedImage.mimeType,
          data: processedImage.base64,
        },
      },
      {
        text:
          `You are a graphic designer creating merchandise designs. Analyze this image and create an image generation prompt based on: "${prompt}".

Preservation Level (${preservation}/100): ${preservationInstruction}

Requirements:
- Center the subject with balanced spacing (70-80% of canvas)
- Use bold, high-contrast colors that work on fabric
- Clean edges, well-defined shapes
${backgroundInstruction}

Output ONLY the prompt text, no explanations.`,
      },
    ]);

    const enhancedPrompt = analysisResult.response.text();
    if (!enhancedPrompt) {
      throw new Error("Failed to generate enhanced prompt");
    }

    // Step 2: Generate image
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const backgroundSuffix = removeBackground
      ? "Transparent background, isolated subject, print-ready artwork."
      : "Include background and environmental context, print-ready artwork.";

    const imageResult = await imageModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${enhancedPrompt}\n\n${backgroundSuffix}` }],
        },
      ],
      generationConfig: { responseModalities: ["image", "text"] } as any,
    });

    const parts = imageResult.response.candidates?.[0]?.content?.parts;
    if (!parts?.length) {
      throw new Error("No image generated from Gemini");
    }

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

    const imageUrl = `data:${generatedMimeType};base64,${generatedImageBase64}`;

    // Step 3: Try to remove background, fallback to original if it fails
    const transparentImageUrl = await this.removeBackgroundSafe(imageUrl);

    return { imageUrl: transparentImageUrl, enhancedPrompt };
  }
}
