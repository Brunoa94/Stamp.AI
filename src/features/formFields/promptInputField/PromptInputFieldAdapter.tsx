"use client";

import { Controller, UseFormReturn, FieldError } from "react-hook-form";
import {
  IImageGenerationForm,
  IImageGenerationResult,
} from "@/schemas/productCreateSchema";
import { theme } from "@/theme";
import clsx from "clsx";
import StepIndicator from "../../ui/step-indicator";
import TipBanner from "../../common/TipBanner";
import PromptInputFields from "@/features/dashboard/createPrompt/promptInput/PromptInputFields";

interface IPromptInputFieldAdapterProps {
  form: UseFormReturn<IImageGenerationForm>;
  uploadedImage: File | undefined;
  isProcessing: boolean;
  generatedResult: IImageGenerationResult | null;
  error?: FieldError;
}

/**
 * Adapter component that integrates the well-organized PromptInputFields
 * with react-hook-form's Controller for seamless form integration.
 * This replaces the less organized PromptInputField component.
 */
const PromptInputFieldAdapter = ({
  form,
  uploadedImage,
  isProcessing,
  generatedResult,
  error,
}: IPromptInputFieldAdapterProps) => {
  const { control } = form;
  const hasUploadedImage = !!uploadedImage;
  const shouldShowTip = hasUploadedImage;
  const shouldHighlightCard =
    hasUploadedImage && !isProcessing && !generatedResult;

  console.log("RE.render");

  return (
    <article
      className={clsx(
        theme.prompt.section,
        theme.animations.slideInRight,
        "transition-all duration-700 ease-out",
        {
          "opacity-60 scale-95": !hasUploadedImage,
          "opacity-100 scale-100": hasUploadedImage,
        },
      )}
    >
      <div
        className={clsx(
          theme.prompt.card,
          "transition-all duration-700 ease-out group hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105",
          {
            "ring-2 ring-blue-300 shadow-xl shadow-blue-500/20 transform scale-102":
              shouldHighlightCard,
          },
        )}
      >
        <StepIndicator
          stepNumber="2"
          title="Describe Your Vision"
          isActive={hasUploadedImage}
          isDisabled={!hasUploadedImage}
          titleClassName={theme.prompt.title}
        />

        {/* Tip Banner - Shows inside prompt section when image is uploaded */}
        {shouldShowTip && <TipBanner uploadedImage={uploadedImage} />}

        {/* Use Controller to integrate with react-hook-form */}
        <Controller
          name="prompt"
          control={control}
          render={({ field: { value, onChange, onBlur } }) => (
            <PromptInputFields
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={!hasUploadedImage}
              isProcessing={isProcessing}
              hasUploadedFile={hasUploadedImage}
            />
          )}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 text-center">{error.message}</p>
          </div>
        )}
      </div>
    </article>
  );
};

export default PromptInputFieldAdapter;
