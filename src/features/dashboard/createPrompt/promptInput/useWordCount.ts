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
  const wordCount = useMemo(() => getWordCount(text), [text]);

  const isOverLimit = useMemo(() => isWordCountOverLimit(wordCount, limit), [wordCount, limit]);

  const colorClass = useMemo(() => getWordCountColor(wordCount, limit), [wordCount, limit]);

  const progressWidth = useMemo(() => getProgressBarWidth(wordCount, limit), [wordCount, limit]);

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