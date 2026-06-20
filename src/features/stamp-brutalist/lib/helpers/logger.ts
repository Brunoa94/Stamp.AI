/**
 * Logging utilities for Stamp Brutalist feature
 * Provides consistent logging with structured context
 *
 * Pattern:
 * - Use logStampError for exceptions and critical failures
 * - Use logStampWarning for recoverable issues or unexpected states
 * - Use logStampInfo for debugging and tracing execution flow
 * - Always include context (location/function name) and relevant data
 */

/**
 * Logs an error with consistent formatting
 * @param context - The context/location where the error occurred
 * @param error - The error to log
 * @param additionalInfo - Optional additional information
 */
export function logStampError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>,
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(`[Stamp Flow - ${context}]`, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  });
}

/**
 * Logs a warning with consistent formatting
 * @param context - The context/location where the warning occurred
 * @param message - The warning message
 * @param additionalInfo - Optional additional information
 */
export function logStampWarning(
  context: string,
  message: string,
  additionalInfo?: Record<string, unknown>,
): void {
  console.warn(`[Stamp Flow - ${context}]`, message, additionalInfo || "");
}

/**
 * Logs an info message with consistent formatting
 * @param context - The context/location
 * @param message - The info message
 * @param additionalInfo - Optional additional information
 */
export function logStampInfo(
  context: string,
  message: string,
  additionalInfo?: Record<string, unknown>,
): void {
  console.log(`[Stamp Flow - ${context}]`, message, additionalInfo || "");
}
