export interface GeneratedResultTypes {
  imageUrl: string;
  enhancedPrompt: string;
}

export interface StampFlowStateTypes {
  // Step navigation (lightweight - high frequency updates)
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Generation state
  generatedResults: GeneratedResultTypes[];
  setGeneratedResults: (
    results: GeneratedResultTypes[] | ((prev: GeneratedResultTypes[]) => GeneratedResultTypes[])
  ) => void;
  addGeneratedResult: (result: GeneratedResultTypes) => void;

  // Loading states
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  isFinalizing: boolean;
  setIsFinalizing: (value: boolean) => void;

  // Selected state from generation
  selectedImageUrl: string | undefined;
  setSelectedImageUrl: (url: string | undefined) => void;
  enhancedPrompt: string | undefined;
  setEnhancedPrompt: (prompt: string | undefined) => void;

  // Created product state
  createdProductId: string | undefined;
  setCreatedProductId: (id: string | undefined) => void;
  createdVariantId: number | undefined;
  setCreatedVariantId: (id: number | undefined) => void;
  mockupImageUrl: string | undefined;
  setMockupImageUrl: (url: string | undefined) => void;

  // Reset
  reset: () => void;
}
