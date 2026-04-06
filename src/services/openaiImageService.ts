import OpenAI from "openai";

interface OpenAIImageGenerationResult {
  imageUrl: string;
  enhancedPrompt: string;
}

/**
 * OpenAI Image Generation Service
 *
 * This service uses GPT-4o Vision to analyze an uploaded image and create
 * an enhanced prompt, then uses DALL-E 3 to generate a new image.
 *
 * Two-step flow:
 * 1. GPT-4o Vision analyzes the image and creates an enhanced DALL-E prompt
 * 2. DALL-E 3 generates a new image based on the enhanced prompt
 */
export class OpenAIImageService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Generate an image using OpenAI's GPT-4o Vision + DALL-E 3
   *
   * @param imageBuffer - The image file as ArrayBuffer
   * @param mimeType - The MIME type of the image (e.g., "image/jpeg")
   * @param prompt - The user's prompt describing the desired transformation
   * @returns Object containing the generated image URL and enhanced prompt
   */
  static async generateImage(
    imageBuffer: ArrayBuffer,
    mimeType: string,
    prompt: string
  ): Promise<OpenAIImageGenerationResult> {
    // Convert image to base64 data URL
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

    // Step 1: Use GPT-4o Vision to analyze image and generate enhanced prompt
    const visionResponse = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and create a detailed DALL-E prompt to generate a new image based on this description: ${prompt}. Make the prompt descriptive and specific, incorporating elements from the original image while applying the requested transformation. Adapt the image to be well printable on a t-shirt. The a ratio of 8/10 with the original image. Use the uploaded image as base to the generated one.`,
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
      throw new Error("Failed to generate enhanced prompt from GPT-4o Vision");
    }

    // Step 2: Generate new image using DALL-E 3 with HD quality
    const imageResponse = await this.openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
      n: 1,
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to generate image from DALL-E 3");
    }

    return {
      imageUrl: generatedImageUrl,
      enhancedPrompt,
    };
  }
}
