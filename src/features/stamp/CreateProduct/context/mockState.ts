import { CreateProductContextState } from "./types";

export const MOCK_STATE: CreateProductContextState = {
  // Workflow state
  currentStep: "upload",
  completedSteps: [],

  // Form state
  form: null,
  uploadedImage: null,
  prompt: "",
  showPromptCustomization: false,
  preservation: 80,
  selectedStyle: "na",

  // Image generation state
  isGenerating: false,
  generatedResult: null,
  generationError: null,

  // Product creation state
  selectedTshirt: null,
  selectedColor: null,
  selectedSize: null,
  isCreatingProduct: false,
  createdProduct: null,
};
