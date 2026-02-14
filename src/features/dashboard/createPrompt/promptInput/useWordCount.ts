import { useMemo } from "react";
import {
  getWordCount,
  getWordCountColor,
  getProgressBarWidth,
  isWordCountOverLimit,
  canSubmitForm,
} from "@/utils/formUtils";

interface IUseWordCountProps {
  text: string;
  limit?: number;
  hasUploadedFile?: boolean;
  isProcessing?: boolean;
  disabled?: boolean;
}

export const useWordCount = ({
  text,
  limit = 150,
  hasUploadedFile = true,
  isProcessing = false,
  disabled = false,
}: IUseWordCountProps) => {
  const wordCount = getWordCount(text);

  const isOverLimit = isWordCountOverLimit(wordCount, limit);

  const colorClass = getWordCountColor(wordCount, limit);

  const progressWidth = getProgressBarWidth(wordCount, limit);

  const canSubmit = useMemo(() => {
    if (disabled || isProcessing) return false;
    return canSubmitForm(hasUploadedFile, text, wordCount, isProcessing, limit);
  }, [hasUploadedFile, text, wordCount, isProcessing, limit, disabled]);

  return {
    wordCount,
    isOverLimit,
    colorClass,
    progressWidth,
    canSubmit,
    limit,
  };
};