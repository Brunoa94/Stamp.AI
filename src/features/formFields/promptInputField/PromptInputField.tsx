"use client";

import { UseFormReturn, FieldError } from "react-hook-form";
import {
  IProductCreateForm,
  IImageGenerationResult,
} from "@/schemas/productCreateSchema";
import { theme } from "@/theme";
import { Sparkles, Wand2 } from "lucide-react";
import clsx from "clsx";
import WordCountIndicator from "@/features/ui/WordCountIndicator";
import { Textarea } from "@/features/ui/textarea";
import { SubmitButton } from "../components/SubmitButton";
import StepIndicator from "../../ui/step-indicator";
import TipBanner from "../../common/TipBanner";
import { usePromptInputField } from "./usePromptInputField";

interface IPromptInputFieldProps {
  form: UseFormReturn<IProductCreateForm>;
  uploadedImage: File | undefined;
  isProcessing: boolean;
  generatedResult: IImageGenerationResult | null;
  error?: FieldError;
}

const PromptInputField = ({
  form,
  uploadedImage,
  isProcessing,
  generatedResult,
  error,
}: IPromptInputFieldProps) => {
  const { register, prompt, wordCount, isOverLimit, canSubmit } =
    usePromptInputField({
      form,
      uploadedImage,
      isProcessing,
      generatedResult,
      error,
    });

  return (
    <article
      className={clsx(
        theme.prompt.section,
        theme.animations.slideInRight,
        "transition-all duration-700 ease-out",
        {
          "opacity-60 scale-95": !uploadedImage,
          "opacity-100 scale-100": uploadedImage,
        },
      )}
    >
      <div
        className={clsx(
          theme.prompt.card,
          "transition-all duration-700 ease-out group hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105",
          {
            "ring-2 ring-blue-300 shadow-xl shadow-blue-500/20 transform scale-102":
              uploadedImage && !isProcessing && !generatedResult,
          },
        )}
      >
        <StepIndicator
          stepNumber="2"
          title="Describe Your Vision"
          isActive={!!uploadedImage}
          isDisabled={!uploadedImage}
          titleClassName={theme.prompt.title}
        />

        {/* Tip Banner - Shows inside prompt section when image is uploaded */}
        <TipBanner uploadedImage={uploadedImage} />

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Label with animation */}
            <label
              htmlFor="prompt"
              className="flex items-center text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              <Wand2 className="w-5 h-5 mr-2 text-blue-500 animate-[wiggle_0.8s_ease-in-out_infinite]" />
              Describe Your Magical Vision
            </label>

            {/* Textarea with colorful styling */}
            <div className="relative">
              <Textarea
                {...register("prompt")}
                id="prompt"
                disabled={!uploadedImage}
                placeholder="Transform this image into a magical fantasy scene with dragons flying over crystal mountains..."
                className={clsx(
                  "resize-none transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20",
                  {
                    "bg-gray-100 text-gray-400 cursor-not-allowed":
                      !uploadedImage,
                    "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50":
                      uploadedImage && (isOverLimit || error),
                    "border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm":
                      uploadedImage && !isOverLimit && !error,
                  },
                )}
                rows={5}
                maxLength={1000}
              />

              {/* Sparkle decoration */}
              {uploadedImage && prompt?.length > 0 && (
                <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-400 animate-pulse" />
              )}
            </div>

            {/* Word count with animated progress bar */}
            <WordCountIndicator
              wordCount={wordCount}
              isOverLimit={isOverLimit}
              limit={150}
            />

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 text-center">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Animated submit button */}
          {isProcessing ? (
            <SubmitButton.Loading canSubmit={canSubmit} />
          ) : (
            <SubmitButton.Action canSubmit={canSubmit} />
          )}
        </div>
      </div>
    </article>
  );
};

export default PromptInputField;
