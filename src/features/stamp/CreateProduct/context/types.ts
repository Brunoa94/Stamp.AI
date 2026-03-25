import { UseFormReturn } from "react-hook-form";
import { IProductCreateForm, IImageGenerationResult } from "@/schemas/productCreateSchema";
import type { TshirtType } from "@/queries/productQueries";
import { CreatedProductT } from "@/types/customProduct";

export type WorkflowStep =
  | "upload"
  | "form"
  | "synthesis"
  | "generating"
  | "review"
  | "results"
  | "customizing"
  | "fabric"
  | "creating"
  | "sizing"
  | "created";

export interface CreateProductContextState {
  // Workflow state
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];

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
