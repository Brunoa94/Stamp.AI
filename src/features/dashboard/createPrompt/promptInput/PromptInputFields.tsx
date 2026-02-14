"use client";

import PromptTextarea from "../promptTextArea/PromptTextarea";
import { Wand2 } from "lucide-react";
import WordCountIndicator from "@/features/ui/WordCountIndicator";
import { PromptProcessing, PromptSubmit } from "./PromptSubmit";
import { Label } from "@/features/ui/label";
import { useWordCount } from "./useWordCount";

interface PromptInputFieldsProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  isOverLimit?: boolean;
  hasUploadedFile?: boolean;
}

/**
 * Form-less version of PromptInput for integration with react-hook-form
 * Contains just the input fields and UI without form wrapper
 */
const PromptInputFields = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  isProcessing = false,
  hasUploadedFile = true,
}: PromptInputFieldsProps) => {
  const { wordCount, isOverLimit, colorClass, canSubmit, limit } = useWordCount(
    {
      text: value,
      disabled,
      isProcessing,
      hasUploadedFile,
    },
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label
          htmlFor="prompt"
          className="flex items-center text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <Wand2 className="w-5 h-5 mr-2 text-blue-500 animate-[wiggle_0.8s_ease-in-out_infinite]" />
          Describe Your Magical Vision
        </Label>

        <PromptTextarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          isOverLimit={isOverLimit}
        />

        <WordCountIndicator
          wordCount={wordCount}
          limit={limit}
          isOverLimit={isOverLimit}
          colorClass={colorClass}
        />
      </div>
      {isProcessing && <PromptProcessing canSubmit={canSubmit} />}
      {!isProcessing && <PromptSubmit canSubmit={canSubmit} />}
    </div>
  );
};

export default PromptInputFields;
