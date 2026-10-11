import { describe, expect, it } from "vitest";
import { detectImageMimeType } from "./imageUpload";

describe("detectImageMimeType", () => {
  it("recognises PNG, JPEG and WebP by their bytes", () => {
    expect(detectImageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectImageMimeType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectImageMimeType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
  });

  it("rejects anything else, including GIF, SVG and truncated files", () => {
    expect(detectImageMimeType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
    expect(detectImageMimeType(new TextEncoder().encode("<svg xmlns"))).toBeNull();
    expect(detectImageMimeType(new Uint8Array([0x89, 0x50]))).toBeNull();
  });
});
