"use client";

import { memo } from "react";
import PromptTextarea from "../promptTextArea/PromptTextarea";
import { Wand2 } from "lucide-react";
import WordCountIndicator from "@/features/ui/WordCountIndicator";
import { PromptProcessing, PromptSubmit } from "./PromptSubmit";
import { Label } from "@/features/ui/label";
import { usePromptInput } from "./usePromptInput";

interface Props {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

const PromptInput = ({
  onSubmit,
  disabled = false,
  isProcessing = false,
}: Props) => {
  const {
    prompt,
    handleSubmit,
    handleTextChange,
    wordCount,
    isOverLimit,
    colorClass,
    canSubmit,
    limit,
  } = usePromptInput({ onSubmit, disabled, isProcessing });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label
          htmlFor="prompt"
          className="flex items-center text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <Wand2 className="w-5 h-5 mr-2 text-blue-500 animate-[wiggle_0.8s_ease-in-out_infinite]" />
          Describe Your Magical Vision
        </Label>

        <PromptTextarea
          value={prompt}
          onChange={handleTextChange}
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
    </form>
  );
};

export default memo(PromptInput);
