import { z } from "zod";

export const StampFormSchema = z.object({
  // Step 1: Upload
  referenceImage: z.instanceof(File).optional(),

  // Step 2: Synthesis
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(500, "Prompt must be at most 500 characters"),
  artStyle: z.enum(['realistic', 'cartoon', 'abstract', 'minimal', 'watercolor', 'oil', 'digital', 'sketch']),
  preservation: z.number().min(0).max(100),

  // Step 4: Results (selected from generation)
  selectedImageUrl: z.string().optional(),
  enhancedPrompt: z.string().optional(),

  // Step 5: Product Spec
  productType: z.enum(['tee', 'hoodie', 'tote', 'poster']).optional(),
  blueprintId: z.number().optional(),
  printProviderId: z.number().optional(),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),

  // Internal state
  currentStep: z.number(),
  isGenerating: z.boolean(),
  isFinalizing: z.boolean(),
  generatedResults: z.array(z.object({
    imageUrl: z.string(),
    enhancedPrompt: z.string(),
  })),
  createdProductId: z.string().optional(),
  mockupImageUrl: z.string().optional(),
});

export type StampFormData = z.infer<typeof StampFormSchema>;
