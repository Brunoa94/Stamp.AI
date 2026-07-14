"use client";

import { ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StampFormSchema,
  StampFormDataType,
} from "../schemas/stampFormSchema";

// Re-export store and hooks for backward compatibility
export { useStampFlowStore } from "../stores/stampFlowStore";
export {
  useStampStep,
  useStampUpload,
  useStampGeneration,
  useStampSelectedImage,
  useStampFinalization,
} from "../hooks/useStampSelectors";

// ============================================================================
// PROVIDER COMPONENT - Lightweight wrapper for React Hook Form
// ============================================================================

interface StampFormProviderPropsType {
  children: ReactNode;
  defaultValues?: Partial<StampFormDataType>;
}

/**
 * Provides React Hook Form context for stamp form fields.
 * For flow state (steps, generation, etc.), use the Zustand store hooks directly.
 */
export function StampFormProvider({
  children,
  defaultValues,
}: StampFormProviderPropsType) {
  const methods = useForm<StampFormDataType>({
    resolver: zodResolver(StampFormSchema),
    defaultValues: {
      currentStep: 0,
      preservation: 50,
      isGenerating: false,
      isFinalizing: false,
      generationProgress: 0,
      productionProgress: 0,
      generatedResults: [],
      prompt: "",
      productType: "tshirt",
      fabricColor: "#000000",
      size: "M",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
