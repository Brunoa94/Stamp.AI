import OpenAI from "openai";
import fs from "fs";
import path from "path";

interface OpenAIImageGenerationResult {
  imageUrl: string;
  enhancedPrompt: string;
}

// Use mock image for local development (uses public/zoe.png)
const USE_MOCK_IMAGE = process.env.NODE_ENV === "development";

/**
 * OpenAI Image Generation Service
 *
 * Uses GPT-4o for prompt enhancement and GPT Image 1 Mini for image generation
 * with native transparent background support (lowest cost option ~$0.005/image)
 */
export class OpenAIImageService {
  private static getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    return new OpenAI({ apiKey });
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
      return "The subject must be completely isolated with NO background elements, NO shadows, NO floor reflections. Clean, crisp edges suitable for print production.";
    }
    return "Include background and environmental context from the original image.";
  }

  /**
   * Generate a mock image for local development (uses public/zoe.png)
   */
  private static generateMockImage(
    prompt: string,
    removeBackground: boolean,
  ): OpenAIImageGenerationResult {
    console.log("[MOCK] Using mock image instead of OpenAI API");
    console.log("[MOCK] Prompt:", prompt);
    console.log("[MOCK] Remove background:", removeBackground);

    const mockImagePath = path.join(process.cwd(), "public", "zoe.png");
    const mockImageBuffer = fs.readFileSync(mockImagePath);
    const mockImageBase64 = mockImageBuffer.toString("base64");
    const imageUrl = `data:image/png;base64,${mockImageBase64}`;

    const mockEnhancedPrompt = `[MOCK] Enhanced prompt based on: "${prompt}" with removeBackground=${removeBackground}`;

    return {
      imageUrl,
      enhancedPrompt: mockEnhancedPrompt,
    };
  }

  /**
   * Generate an image using OpenAI with optional transparent background
   * @param imageBuffer - The input image as ArrayBuffer
   * @param mimeType - The MIME type of the input image
   * @param prompt - The user's prompt for image generation
   * @param preservation - Level of preservation (0-100). Higher = stay closer to original image.
   * @param removeBackground - Whether to generate with transparent background
   */
  static async generateImage(
    imageBuffer: ArrayBuffer,
    mimeType: string,
    prompt: string,
    preservation: number = 50,
    removeBackground: boolean = true,
  ): Promise<OpenAIImageGenerationResult> {
    // Use mock image for local development
    if (USE_MOCK_IMAGE) {
      return this.generateMockImage(prompt, removeBackground);
    }

    const client = this.getClient();

    // Convert image to base64 data URL
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

    const preservationInstruction = this.getPreservationInstruction(preservation);
    const backgroundInstruction = this.getBackgroundInstruction(removeBackground);

    // Step 1: Use GPT-4o to analyze the image and create an enhanced prompt
    const visionResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a graphic designer creating merchandise designs. Analyze this image and create an image generation prompt based on: "${prompt}".

Preservation Level (${preservation}/100): ${preservationInstruction}

Requirements:
- Center the subject with balanced spacing (70-80% of canvas)
- Use bold, high-contrast colors that work on fabric
- Clean edges, well-defined shapes
- ${backgroundInstruction}

Output ONLY the prompt text, no explanations.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const enhancedPrompt = visionResponse.choices[0]?.message?.content;

    if (!enhancedPrompt) {
      throw new Error("Failed to generate enhanced prompt");
    }

    // Step 2: Generate image using GPT Image 1 Mini (lowest cost) with optional transparency
    const imageResponse = await client.images.generate({
      model: "gpt-image-1-mini",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "low",
      n: 1,
      ...(removeBackground
        ? {
            background: "transparent",
            output_format: "png",
          }
        : {
            output_format: "png",
          }),
    } as Parameters<typeof client.images.generate>[0]);

    // Handle potential streaming response
    if (!("data" in imageResponse) || !imageResponse.data) {
      throw new Error("Unexpected response format from OpenAI");
    }

    const generatedImageData = imageResponse.data[0];

    if (!generatedImageData) {
      throw new Error("Failed to generate image");
    }

    // GPT Image models return base64 data in b64_json
    let imageUrl: string;
    if ("b64_json" in generatedImageData && generatedImageData.b64_json) {
      imageUrl = `data:image/png;base64,${generatedImageData.b64_json}`;
    } else if ("url" in generatedImageData && generatedImageData.url) {
      // Fallback for URL response (fetch and convert to base64)
      const response = await fetch(generatedImageData.url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      imageUrl = `data:image/png;base64,${base64}`;
    } else {
      throw new Error("No image data found in OpenAI response");
    }

    return { imageUrl, enhancedPrompt };
  }
}
