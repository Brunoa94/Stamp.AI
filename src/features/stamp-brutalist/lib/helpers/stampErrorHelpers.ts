/**
 * Error handling utilities for Stamp Brutalist feature
 * Re-exports from separated modules for backward compatibility
 *
 * @deprecated Import from specific modules instead:
 * - validation.ts for validation functions
 * - logger.ts for logging functions
 * - errorMessages.ts for error messages
 * - @/shared/helpers/storage.ts for localStorage operations
 */

// Validation helpers
export {
  isValidStep,
  isValidGeneratedResult,
  isValidUrl,
} from "./validation";

// Logging helpers
export { logStampError, logStampWarning, logStampInfo } from "./logger";

// Error messages
export {
  STAMP_ERROR_MESSAGES,
  getStampErrorMessage,
  type StampErrorMessageKey,
} from "./errorMessages";

// Storage helpers - wrapped to maintain the same API
import {
  safeLocalStorageSave as baseSave,
  safeLocalStorageLoad as baseLoad,
  safeLocalStorageRemove as baseRemove,
} from "@/shared/helpers/storage";
import { logStampWarning } from "./logger";

export function safeLocalStorageSave(key: string, data: unknown): boolean {
  return baseSave(key, data, logStampWarning);
}

export function safeLocalStorageLoad<T>(key: string, fallback: T): T {
  return baseLoad(key, fallback, logStampWarning);
}

export function safeLocalStorageRemove(key: string): boolean {
  return baseRemove(key, logStampWarning);
}
