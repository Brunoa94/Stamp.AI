"use client";

import { Sparkles } from "lucide-react";
import { WizardActionFooter } from "@/features/ui/wizard-action-footer";
import { CreateProductSelectors } from "../context/selectors";
import useProductCustomizerSection from "../steps/CustomizerStep/ProductCustomizer/hooks/useProductCustomizerSection";
import {
  getContinueEnabled,
  getContinueText,
  getVisibleSections,
} from "../utils/stepHelpers";

interface CreateProductActionFooterProps {
  onCancel: () => void;
  onContinue: () => void;
}

export function CreateProductActionFooter({
  onCancel,
  onContinue,
}: CreateProductActionFooterProps) {
  const currentStep = CreateProductSelectors.currentStep();
  const uploadedImage = CreateProductSelectors.uploadedImage();
  const promptValue = CreateProductSelectors.prompt();
  const isGenerating = CreateProductSelectors.isGenerating();
  const selectedTshirt = CreateProductSelectors.selectedTshirt();

  const { canStampIt } = useProductCustomizerSection({ selectedTshirt });

  const hasUploadedImage = !!uploadedImage;
  const canContinueFromUpload = hasUploadedImage;
  const promptLength = promptValue?.trim().length || 0;
  const canGenerate = hasUploadedImage && promptLength >= 10 && !isGenerating;
  const continueEnabled = getContinueEnabled(
    currentStep,
    canContinueFromUpload,
    canGenerate,
    canStampIt,
  );
  const continueText = getContinueText(currentStep);
  const sections = getVisibleSections(currentStep);

  return (
    <WizardActionFooter
      onCancel={onCancel}
      onBack={undefined}
      onContinue={onContinue}
      canContinue={continueEnabled}
      continueText={continueText}
      continueIcon={
        sections.isSynthesisStep ? <Sparkles className="text-2xl" /> : undefined
      }
    />
  );
}
