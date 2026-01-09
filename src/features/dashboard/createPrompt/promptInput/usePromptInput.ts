import { useState } from "react";
import { useWordCount } from "./useWordCount";

interface UsePromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function usePromptInput({ onSubmit, disabled = false, isProcessing = false }: UsePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const { wordCount, isOverLimit, colorClass, canSubmit, limit } = useWordCount({
    text: prompt,
    disabled,
    isProcessing,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (canSubmit) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return {
    prompt,
    handleSubmit,
    handleTextChange,
    wordCount,
    isOverLimit,
    colorClass,
    canSubmit,
    limit,
  };
}