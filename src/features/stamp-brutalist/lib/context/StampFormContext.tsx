"use client";

import { ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StampFormSchema, StampFormData } from "../schemas/stampFormSchema";

// Re-export store and hooks for backward compatibility
export { useStampFlowStore } from "../stores/stampFlowStore";
export {
  useStampStep,
  useStampGeneration,
  useStampFinalization,
  useStampSelectedImage,
  useStampData,
} from "../hooks/useStampSelectors";

// ============================================================================
// PROVIDER COMPONENT - Lightweight wrapper for React Hook Form
// ============================================================================

interface StampFormProviderPropsTypes {
  children: ReactNode;
  defaultValues?: Partial<StampFormData>;
}

/**
 * Provides React Hook Form context for stamp form fields.
 * For flow state (steps, generation, etc.), use the Zustand store hooks directly.
 */
export function StampFormProvider({
  children,
  defaultValues,
}: StampFormProviderPropsTypes) {
  const methods = useForm<StampFormData>({
    resolver: zodResolver(StampFormSchema),
    defaultValues: {
      currentStep: 1,
      artStyle: "realistic",
      preservation: 50,
      isGenerating: false,
      isFinalizing: false,
      generatedResults: [],
      prompt: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
