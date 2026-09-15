/**
 * Server-side validation for uploaded reference images.
 *
 * The client (useStampImageUpload) enforces a 10 MB limit; the server must
 * enforce the same so a crafted request cannot push oversized payloads to the
 * image providers. MIME type is decided from the file's magic bytes, never
 * from the client-supplied `File.type`, and anything outside the allowlist is
 * rejected instead of being defaulted to JPEG.
 */

/** Matches MAX_FILE_SIZE in src/features/stamp/lib/hooks/useStampImageUpload.ts */
export const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024;

export type AllowedImageMimeT = "image/png" | "image/jpeg" | "image/webp";

export const ALLOWED_IMAGE_MIME_TYPES: ReadonlySet<AllowedImageMimeT> = new Set<AllowedImageMimeT>([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((value, index) => bytes[offset + index] === value);
}

/**
 * Sniff an allowlisted image type from the first bytes of a file.
 * Returns null when the content is not PNG, JPEG or WebP.
 */
export function detectImageMimeType(bytes: Uint8Array): AllowedImageMimeT | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  return null;
}
