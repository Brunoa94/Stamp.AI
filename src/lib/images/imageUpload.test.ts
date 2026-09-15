import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  detectImageMimeType,
  MAX_UPLOAD_IMAGE_BYTES,
} from "./imageUpload";

function bytes(...values: number[]): Uint8Array {
  const buffer = new Uint8Array(16);
  buffer.set(values);
  return buffer;
}

describe("imageUpload constants", () => {
  it("matches the 10 MB client-side limit", () => {
    expect(MAX_UPLOAD_IMAGE_BYTES).toBe(10 * 1024 * 1024);
  });

  it("only allows png, jpeg and webp", () => {
    expect([...ALLOWED_IMAGE_MIME_TYPES].sort()).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });
});

describe("detectImageMimeType", () => {
  it("detects JPEG from its magic bytes", () => {
    expect(detectImageMimeType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
  });

  it("detects PNG from its magic bytes", () => {
    expect(detectImageMimeType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(
      "image/png",
    );
  });

  it("detects WebP from the RIFF/WEBP container", () => {
    const riff = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
    expect(detectImageMimeType(riff)).toBe("image/webp");
  });

  it("returns null for GIF (not in the allowlist)", () => {
    expect(detectImageMimeType(bytes(0x47, 0x49, 0x46, 0x38))).toBeNull();
  });

  it("returns null for unknown bytes instead of defaulting", () => {
    expect(detectImageMimeType(bytes(0x00, 0x01, 0x02, 0x03))).toBeNull();
    expect(detectImageMimeType(new Uint8Array(0))).toBeNull();
  });

  it("returns null for text disguised as an image", () => {
    expect(detectImageMimeType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
});
