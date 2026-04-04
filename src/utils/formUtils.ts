/**
 * Form-related utility functions
 */

/**
 * Calculate word count from a string
 * @param text - The text to count words from
 * @returns The number of words in the text
 */
export const getWordCount = (text: string | undefined): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Get word count color class based on count and limit
 * @param wordCount - Current word count
 * @param limit - Maximum allowed words
 * @returns Tailwind color class
 */
export const getWordCountColor = (wordCount: number, limit: number = 150): string => {
  const percentage = (wordCount / limit) * 100;

  if (wordCount > limit) return "text-red-500";
  if (percentage > 93) return "text-yellow-500"; // 140/150 words
  if (percentage > 67) return "text-blue-500";   // 100/150 words
  return "text-slate-600";
};

/**
 * Calculate progress bar width percentage
 * @param wordCount - Current word count
 * @param limit - Maximum allowed words
 * @returns Percentage as number (0-100)
 */
export const getProgressBarWidth = (wordCount: number, limit: number = 150): number => {
  return Math.min((wordCount / limit) * 100, 100);
};

/**
 * Check if word count exceeds limit
 * @param wordCount - Current word count
 * @param limit - Maximum allowed words
 * @returns Boolean indicating if over limit
 */
export const isWordCountOverLimit = (wordCount: number, limit: number = 150): boolean => {
  return wordCount > limit;
};

/**
 * Check if form can be submitted
 * @param hasUploadedFile - Whether a file has been uploaded
 * @param prompt - The prompt text
 * @param wordCount - Current word count
 * @param isProcessing - Whether form is currently processing
 * @param limit - Maximum allowed words
 * @returns Boolean indicating if form can be submitted
 */
export const canSubmitForm = (
  hasUploadedFile: boolean,
  prompt: string | undefined,
  wordCount: number,
  isProcessing: boolean,
  limit: number = 150
): boolean => {
  if(!prompt) return false
  const hasValidPrompt = prompt?.trim().length > 0;
  const isUnderLimit = !isWordCountOverLimit(wordCount, limit);

  return hasUploadedFile && hasValidPrompt && isUnderLimit && !isProcessing;
};