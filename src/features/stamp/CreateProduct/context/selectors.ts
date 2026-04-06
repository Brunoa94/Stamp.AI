import { useNavigationSelector, useFormSelector } from "./CreateProductContextSubscriber";
import type { NavigationState, FormState } from "./types";

// ---------------------------------------------------------------------------
// Module-level selector functions
// ---------------------------------------------------------------------------
// CRITICAL: these must be defined at module scope (not inline in the hook
// call) so that `useSyncExternalStoreWithSelector`'s internal useMemo never
// sees a new selector reference. A new reference forces the memoization cache
// to reset, which re-renders the subscriber on every store update even when
// the selected value has not changed. Keeping stable references here was the
// root cause of the 57-render problem for CreateProductSidebar.

// Navigation selectors (NavigationStore — silent during form keystrokes)
const selectCurrentStep = (s: NavigationState) => s.currentStep;
const selectCompletedSteps = (s: NavigationState) => s.completedSteps;

// Form selectors (FormStore)
const selectForm = (s: FormState) => s.form;
const selectUploadedImage = (s: FormState) => s.uploadedImage;
const selectPrompt = (s: FormState) => s.prompt;
const selectShowPromptCustomization = (s: FormState) =>
  s.showPromptCustomization;
const selectPreservation = (s: FormState) => s.preservation;
const selectSelectedStyle = (s: FormState) => s.selectedStyle;
const selectIsGenerating = (s: FormState) => s.isGenerating;
const selectGeneratedResult = (s: FormState) => s.generatedResult;
const selectGeneratedHistory = (s: FormState) => s.generatedHistory;
const selectGenerationError = (s: FormState) => s.generationError;
const selectSelectedTshirt = (s: FormState) => s.selectedTshirt;
const selectIsCreatingProduct = (s: FormState) => s.isCreatingProduct;
const selectCreatedProduct = (s: FormState) => s.createdProduct;
const selectSelectedColor = (s: FormState) => s.selectedColor;
const selectSelectedSize = (s: FormState) => s.selectedSize;

// ---------------------------------------------------------------------------
// Derived boolean selectors
// ---------------------------------------------------------------------------
// Instead of subscribing to the raw `prompt` string (changes every keystroke),
// components that only need a boolean gate should use these derived selectors
// so they re-render only when the boolean flips — not on every character typed.

/** True when an image has been uploaded */
export const selectHasUploadedImage = (s: FormState) => !!s.uploadedImage;

/** True when the prompt is long enough to trigger generation (≥ 10 chars) */
export const selectHasEnoughPrompt = (s: FormState) =>
  (s.prompt?.trim().length ?? 0) >= 10;

// ---------------------------------------------------------------------------
// Public selector map
// ---------------------------------------------------------------------------

export const CreateProductSelectors = {
  // Navigation (NavigationStore) — NOT re-rendered by form keystrokes
  currentStep: () => useNavigationSelector(selectCurrentStep),
  completedSteps: () => useNavigationSelector(selectCompletedSteps),

  // Form + async (FormStore)
  form: () => useFormSelector(selectForm),
  uploadedImage: () => useFormSelector(selectUploadedImage),
  prompt: () => useFormSelector(selectPrompt),
  showPromptCustomization: () => useFormSelector(selectShowPromptCustomization),
  preservation: () => useFormSelector(selectPreservation),
  selectedStyle: () => useFormSelector(selectSelectedStyle),
  isGenerating: () => useFormSelector(selectIsGenerating),
  generatedResult: () => useFormSelector(selectGeneratedResult),
  generatedHistory: () => useFormSelector(selectGeneratedHistory),
  generationError: () => useFormSelector(selectGenerationError),
  selectedTshirt: () => useFormSelector(selectSelectedTshirt),
  isCreatingProduct: () => useFormSelector(selectIsCreatingProduct),
  createdProduct: () => useFormSelector(selectCreatedProduct),
  selectedColor: () => useFormSelector(selectSelectedColor),
  selectedSize: () => useFormSelector(selectSelectedSize),

  // Derived — flip only when the boolean outcome changes
  hasUploadedImage: () => useFormSelector(selectHasUploadedImage),
  hasEnoughPrompt: () => useFormSelector(selectHasEnoughPrompt),
} as const;
