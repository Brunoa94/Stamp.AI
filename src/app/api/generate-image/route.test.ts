// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  generateImage: vi.fn(),
  captureError: vi.fn(() => "err_test_id"),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));

vi.mock("@/services/openaiImageService", () => ({
  OpenAIImageService: { generateImage: mocks.generateImage },
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: mocks.captureError,
}));

import { maxDuration, POST } from "./route";

const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function imageFile(header: number[], size = 64, type = "image/png"): File {
  const data = new Uint8Array(size);
  data.set(header);
  return new File([data], "upload.bin", { type });
}

function request(fields: Record<string, string | File>): NextRequest {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }
  return new NextRequest("https://stamp.ai/api/generate-image", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/generate-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.generateImage.mockResolvedValue({
      imageUrl: "data:image/png;base64,AAAA",
      enhancedPrompt: "enhanced",
    });
  });

  it("declares a maxDuration long enough for the two-step OpenAI pipeline", () => {
    expect(maxDuration).toBeGreaterThanOrEqual(120);
    expect(maxDuration).toBeLessThanOrEqual(300);
  });

  it("rejects unauthenticated requests", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request({ prompt: "x", image: imageFile(PNG_HEADER) }));

    expect(response.status).toBe(401);
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("requires a prompt and an image", async () => {
    expect((await POST(request({ image: imageFile(PNG_HEADER) }))).status).toBe(400);
    expect((await POST(request({ prompt: "x" }))).status).toBe(400);
  });

  it("rejects images over the 10 MB server-side limit with 413", async () => {
    const tooBig = imageFile(PNG_HEADER, 10 * 1024 * 1024 + 1);

    const response = await POST(request({ prompt: "x", image: tooBig }));

    expect(response.status).toBe(413);
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("rejects files whose bytes are not png/jpeg/webp even if the client claims otherwise", async () => {
    const gif = imageFile([0x47, 0x49, 0x46, 0x38], 64, "image/png");

    const response = await POST(request({ prompt: "x", image: gif }));

    expect(response.status).toBe(415);
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("passes the sniffed MIME type and an abort signal to the provider", async () => {
    const jpegClaimingPng = imageFile([0xff, 0xd8, 0xff, 0xe0], 64, "image/png");

    const response = await POST(
      request({ prompt: "a cat", image: jpegClaimingPng, preservation: "70", removeBackground: "false" }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      imageUrl: "data:image/png;base64,AAAA",
      enhancedPrompt: "enhanced",
      originalPrompt: "a cat",
    });

    const [buffer, mimeType, prompt, preservation, removeBackground, options] =
      mocks.generateImage.mock.calls[0];
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(mimeType).toBe("image/jpeg");
    expect(prompt).toBe("a cat");
    expect(preservation).toBe(70);
    expect(removeBackground).toBe(false);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("never echoes the raw provider error message", async () => {
    mocks.generateImage.mockRejectedValue(new Error("secret internal detail sk-abc"));

    const response = await POST(request({ prompt: "x", image: imageFile(PNG_HEADER) }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret internal detail");
    expect(body.details).toBeUndefined();
    expect(body.errorId).toBe("err_test_id");
    expect(mocks.captureError).toHaveBeenCalledTimes(1);
  });

  it("returns 504 when the generation deadline is exceeded", async () => {
    mocks.generateImage.mockRejectedValue(new DOMException("timed out", "TimeoutError"));

    const response = await POST(request({ prompt: "x", image: imageFile(PNG_HEADER) }));

    expect(response.status).toBe(504);
    expect((await response.json()).error).toMatch(/too long/i);
  });

  it("maps moderation blocks to a client-facing message", async () => {
    mocks.generateImage.mockRejectedValue(new Error("400 moderation_blocked"));

    const response = await POST(request({ prompt: "x", image: imageFile(PNG_HEADER) }));

    expect(response.status).toBe(422);
    expect((await response.json()).error).toMatch(/moderation/i);
  });
});
