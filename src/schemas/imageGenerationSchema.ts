import { z } from "zod";

export const imageGenerationSchema = z.object({
  image: z
    .instanceof(File, { message: "Please upload an image" })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      "Image must be less than 10MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Image must be JPEG, PNG, WEBP, or GIF format"
    ),
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(500, "Prompt must be less than 500 characters")
    .refine(
      (prompt) => prompt.trim().split(/\s+/).length <= 150,
      "Prompt must be less than 150 words"
    ),
});

export type IImageGenerationForm = z.infer<typeof imageGenerationSchema>;

export interface IImageGenerationResult {
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}