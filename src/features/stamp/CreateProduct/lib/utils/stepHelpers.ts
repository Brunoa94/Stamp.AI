/**
 * Utility functions for wizard step logic
 */

/**
 * Determines which sections to show based on current step
 */
export function getVisibleSections(currentStep: string) {
  return {
    showFabricSection: currentStep === "fabric",
    showCreatingSection: currentStep === "creating",
    showSizingSection: currentStep === "sizing",
    showCustomizerSection: currentStep === "customizing",
    showFormSection:
      currentStep !== "customizing" &&
      currentStep !== "fabric" &&
      currentStep !== "sizing" &&
      currentStep !== "creating",
    isUploadStep: currentStep === "upload" || currentStep === "form",
    isSynthesisStep: currentStep === "synthesis",
    isGeneratingStep: currentStep === "generating",
    isResultsStep: currentStep === "results",
  };
}

/**
 * Determines if continue button should be enabled
 */
export function getContinueEnabled(
  currentStep: string,
  canContinueFromUpload: boolean,
  canGenerate: boolean,
  canStampIt: string | boolean | null | undefined
): boolean {
  if (currentStep === "upload" || currentStep === "form") {
    return canContinueFromUpload;
  }
  if (currentStep === "synthesis") {
    return canGenerate;
  }
  if (currentStep === "generating" || currentStep === "creating") {
    return false;
  }
  if (currentStep === "fabric") {
    return !!canStampIt;
  }
  if (currentStep === "customizing") {
    return true;
  }
  return false;
}

/**
 * Gets button text based on current step
 */
export function getContinueText(currentStep: string): string {
  if (currentStep === "synthesis") {
    return "Generate";
  }
  if (currentStep === "fabric") {
    return "Create Product";
  }
  return "Continue";
}
