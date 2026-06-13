/**
 * Safe localStorage utilities
 * Provides error-safe operations for localStorage with logging
 * Can be used across features for consistent storage handling
 */

/**
 * Generic logging function type for storage operations
 */
type LogWarning = (
  context: string,
  message: string,
  additionalInfo?: Record<string, unknown>,
) => void;

// Default no-op logger
const defaultLogWarning: LogWarning = () => {};

/**
 * Safely saves data to localStorage with error handling
 * @param key - The localStorage key
 * @param data - The data to save
 * @param logWarning - Optional warning logger
 * @returns {boolean} True if save was successful
 */
export function safeLocalStorageSave(
  key: string,
  data: unknown,
  logWarning: LogWarning = defaultLogWarning,
): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    logWarning("localStorage", `Failed to save to key: ${key}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Safely loads data from localStorage with error handling
 * @param key - The localStorage key
 * @param fallback - Fallback value if load fails
 * @param logWarning - Optional warning logger
 * @returns The parsed data or fallback value
 */
export function safeLocalStorageLoad<T>(
  key: string,
  fallback: T,
  logWarning: LogWarning = defaultLogWarning,
): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    logWarning("localStorage", `Failed to load from key: ${key}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

/**
 * Safely removes data from localStorage with error handling
 * @param key - The localStorage key
 * @param logWarning - Optional warning logger
 * @returns {boolean} True if removal was successful
 */
export function safeLocalStorageRemove(
  key: string,
  logWarning: LogWarning = defaultLogWarning,
): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logWarning("localStorage", `Failed to remove key: ${key}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
