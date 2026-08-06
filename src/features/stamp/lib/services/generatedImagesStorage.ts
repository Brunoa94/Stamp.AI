import type { GeneratedResultType } from "../types/stampFlowTypes";
import { logStampWarn } from "../helpers/stampLogger";

/**
 * Generated Images Storage Service
 *
 * Manages localStorage persistence for generated images with 24-hour TTL.
 * Images are automatically cleaned up when expired.
 */

const STORAGE_KEY = "stamp:generated-images";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_ITEMS = 20;

interface StoredImageEntry {
  result: GeneratedResultType;
  createdAt: number; // Unix timestamp
}

interface StorageData {
  entries: StoredImageEntry[];
}

/**
 * Check if an entry has expired based on TTL
 */
function isExpired(entry: StoredImageEntry): boolean {
  return Date.now() - entry.createdAt > TTL_MS;
}

/**
 * Get all stored images, filtering out expired ones
 */
export function getStoredImages(): GeneratedResultType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: StorageData = JSON.parse(raw);
    if (!data.entries || !Array.isArray(data.entries)) return [];

    // Filter out expired entries
    const validEntries = data.entries.filter((entry) => !isExpired(entry));

    // If we filtered any, update storage
    if (validEntries.length !== data.entries.length) {
      saveEntries(validEntries);
    }

    return validEntries.map((entry) => entry.result);
  } catch (error) {
    logStampWarn({
      scope: "generatedImagesStorage",
      event: "get_stored_images_failed",
      error,
    });
    return [];
  }
}

/**
 * Save entries to localStorage
 */
function saveEntries(entries: StoredImageEntry[]): void {
  const data: StorageData = { entries };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Add a new generated image to storage
 */
export function addStoredImage(result: GeneratedResultType): void {
  try {
    const currentImages = getStoredImagesRaw();

    const newEntry: StoredImageEntry = {
      result,
      createdAt: Date.now(),
    };

    // Prepend new entry and limit to MAX_ITEMS
    const updatedEntries = [newEntry, ...currentImages].slice(0, MAX_ITEMS);
    saveEntries(updatedEntries);
  } catch (error) {
    logStampWarn({
      scope: "generatedImagesStorage",
      event: "add_stored_image_failed",
      error,
    });
  }
}

/**
 * Get raw entries (including timestamps) without filtering
 */
function getStoredImagesRaw(): StoredImageEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: StorageData = JSON.parse(raw);
    if (!data.entries || !Array.isArray(data.entries)) return [];

    // Filter out expired entries
    return data.entries.filter((entry) => !isExpired(entry));
  } catch {
    return [];
  }
}

/**
 * Clear all stored images
 */
export function clearStoredImages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logStampWarn({
      scope: "generatedImagesStorage",
      event: "clear_stored_images_failed",
      error,
    });
  }
}

/**
 * Get the creation timestamp of a stored image by URL
 */
export function getImageCreatedAt(imageUrl: string): Date | null {
  try {
    const entries = getStoredImagesRaw();
    const entry = entries.find((e) => e.result.imageUrl === imageUrl);
    return entry ? new Date(entry.createdAt) : null;
  } catch {
    return null;
  }
}

/**
 * Check if there are any stored images
 */
export function hasStoredImages(): boolean {
  return getStoredImages().length > 0;
}
