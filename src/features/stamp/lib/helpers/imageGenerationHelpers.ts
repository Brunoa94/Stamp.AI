/**
 * Image Generation Helpers
 *
 * Pure helpers used by useStampImageGeneration: reference-image file
 * conversion, the generation timeout error, and the simulated progress
 * ticker shown while the AI request runs.
 */

export class ImageGenerationTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageGenerationTimeoutError";
  }
}

/**
 * Convert a data URL to a File object.
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Resolve the reference image for a generation request:
 * - data URL -> converted File
 * - remote URL -> fetched and wrapped as a File
 * - nothing uploaded -> minimal placeholder (backend uses its mock image)
 */
export async function resolveReferenceImageFile(
  uploadedImageUrl: string | null,
): Promise<File> {
  if (uploadedImageUrl) {
    if (uploadedImageUrl.startsWith("data:")) {
      return dataURLtoFile(uploadedImageUrl, `reference-${Date.now()}.png`);
    }
    const response = await fetch(uploadedImageUrl);
    const blob = await response.blob();
    return new File([blob], `reference-${Date.now()}.png`, {
      type: blob.type,
    });
  }
  const placeholderBlob = new Blob([new Uint8Array(1)], { type: "image/png" });
  return new File([placeholderBlob], `placeholder-${Date.now()}.png`, {
    type: "image/png",
  });
}

/**
 * Drive a simulated progress bar toward 90% while an async operation runs.
 * Returns a stop function that clears the interval.
 */
export function startSimulatedProgress(
  setProgress: (update: (prev: number) => number) => void,
  intervalMs = 400,
): () => void {
  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 90) {
        clearInterval(interval);
        return 90;
      }
      return prev + 10;
    });
  }, intervalMs);
  return () => clearInterval(interval);
}
