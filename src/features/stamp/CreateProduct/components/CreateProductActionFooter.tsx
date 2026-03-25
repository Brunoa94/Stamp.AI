"use client";

import { Coins, Sparkles } from "lucide-react";
import { WizardActionFooter } from "@/features/ui/wizard-action-footer";
import { CreateProductSelectors } from "../context/selectors";
import useProductCustomizerSection from "../steps/CustomizerStep/ProductCustomizer/hooks/useProductCustomizerSection";
import {
  getContinueEnabled,
  getContinueText,
  getVisibleSections,
} from "../utils/stepHelpers";
import { useCoins } from "@/queries/coinsQueries";

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
  const { coins, isLoading: isCoinsLoading } = useCoins();

  const hasUploadedImage = !!uploadedImage;
  const canContinueFromUpload = hasUploadedImage;
  const promptLength = promptValue?.trim().length || 0;
  const hasEnoughCoins = coins === null ? true : coins > 0; // optimistic until loaded
  const canGenerate =
    hasUploadedImage && promptLength >= 10 && !isGenerating && hasEnoughCoins;

  const continueEnabled = getContinueEnabled(
    currentStep,
    canContinueFromUpload,
    canGenerate,
    canStampIt,
  );
  const continueText = getContinueText(currentStep);
  const sections = getVisibleSections(currentStep);

  const showNoCoinsMessage =
    sections.isSynthesisStep && !isCoinsLoading && coins === 0;

  return (
    <div>
      {showNoCoinsMessage && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-700 text-sm font-medium">
          <Coins className="w-4 h-4 shrink-0" />
          <span>You have no coins left. Resets tomorrow.</span>
        </div>
      )}
      <WizardActionFooter
        onCancel={onCancel}
        onBack={undefined}
        onContinue={onContinue}
        canContinue={continueEnabled}
        continueText={continueText}
        continueIcon={
          sections.isSynthesisStep ? (
            <Sparkles className="text-2xl" />
          ) : undefined
        }
      />
    </div>
  );
}
