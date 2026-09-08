import { stripHtml, escapeHtml, truncate } from "./html";

/**
 * Create a sanitizer with custom configuration
 */
export function createSanitizer(options: {
  stripHtml?: boolean;
  escapeHtml?: boolean;
  maxLength?: number;
}) {
  return (input: string): string => {
    let result = input;

    if (options.stripHtml) {
      result = stripHtml(result);
    }

    if (options.escapeHtml) {
      result = escapeHtml(result);
    }

    if (options.maxLength && result.length > options.maxLength) {
      result = truncate(result, options.maxLength);
    }

    return result;
  };
}
