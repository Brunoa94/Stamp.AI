import { useCreateProductSubscriberSelector } from "./CreateProductContextSubscriber";

export const CreateProductSelectors = {
  // Workflow state
  currentStep: () =>
    useCreateProductSubscriberSelector((state) => state.currentStep),

  // Form state
  form: () =>
    useCreateProductSubscriberSelector((state) => state.form),
  uploadedImage: () =>
    useCreateProductSubscriberSelector((state) => state.uploadedImage),
  prompt: () =>
    useCreateProductSubscriberSelector((state) => state.prompt),

  // Image generation state
  isGenerating: () =>
    useCreateProductSubscriberSelector((state) => state.isGenerating),
  generatedResult: () =>
    useCreateProductSubscriberSelector((state) => state.generatedResult),
  generationError: () =>
    useCreateProductSubscriberSelector((state) => state.generationError),

  // Product creation state
  selectedTshirt: () =>
    useCreateProductSubscriberSelector((state) => state.selectedTshirt),
  isCreatingProduct: () =>
    useCreateProductSubscriberSelector((state) => state.isCreatingProduct),
  createdProduct: () =>
    useCreateProductSubscriberSelector((state) => state.createdProduct),
} as const;
