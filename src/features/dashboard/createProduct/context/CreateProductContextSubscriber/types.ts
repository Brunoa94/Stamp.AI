import { UseFormReturn } from "react-hook-form";
import { IProductCreateForm, IImageGenerationResult } from "@/schemas/productCreateSchema";
import { TshirtType } from "@/features/dashboard/selectTshirt";
import { CreatedProductT } from "@/types/customProduct";

export type WorkflowStep = "form" | "generating" | "results" | "customizing" | "created";

export interface CreateProductContextState {
  // Workflow state
  currentStep: WorkflowStep;

  // Form state
  form: UseFormReturn<IProductCreateForm> | null;
  uploadedImage: File | null;
  prompt: string;

  // Image generation state
  isGenerating: boolean;
  generatedResult: IImageGenerationResult | null;
  generationError: Error | null;

  // Product creation state
  selectedTshirt: TshirtType | null;
  isCreatingProduct: boolean;
  createdProduct: CreatedProductT | null;
}
