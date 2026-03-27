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

/**
 * Navigation-only state — changes exclusively on step transitions.
 * Components that only need routing info (sidebar, mobile nav) should
 * subscribe to this slice so they are NOT re-rendered by form keystrokes.
 */
export interface NavigationState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}

/**
 * Form + async operation state — can change on every keystroke or async event.
 * Keep heavy subscribers (action footer, form body) isolated here so that
 * navigation-only components stay silent during typing.
 */
export interface FormState {
  form: UseFormReturn<IProductCreateForm> | null;
  uploadedImage: File | null;
  prompt: string;
  isGenerating: boolean;
  generatedResult: IImageGenerationResult | null;
  generationError: Error | null;
  selectedTshirt: TshirtType | null;
  isCreatingProduct: boolean;
  createdProduct: CreatedProductT | null;
}

/** Full combined type — used by actions that span both stores. */
export type CreateProductContextState = NavigationState & FormState;
