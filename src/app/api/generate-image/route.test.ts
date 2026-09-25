// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  userRpc: vi.fn(),
  serviceRpc: vi.fn(),
  generateImage: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.userRpc,
  }),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ rpc: mocks.serviceRpc }),
}));

vi.mock("@/shared/services/openaiImageService", () => ({
  OpenAIImageService: { generateImage: mocks.generateImage },
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

// Signatures padded to 12 bytes: detection needs the full sniff window.
const PNG_MAGIC = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);
const JPEG_MAGIC = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 0,
]);
const WEBP_MAGIC = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);
const NOT_AN_IMAGE = new TextEncoder().encode("<html>not an image</html>");

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function request(
  fields: { prompt?: string; image?: File | null; headers?: HeadersInit } = {},
) {
  const form = new FormData();
  const prompt = fields.prompt ?? "a cat astronaut";
  if (prompt) form.set("prompt", prompt);
  if (fields.image !== null) {
    form.set(
      "image",
      fields.image ?? new File([PNG_MAGIC], "ref.png", { type: "image/png" }),
    );
  }
  return new NextRequest("https://stamp.ai/api/generate-image", {
    method: "POST",
    body: form,
    headers: fields.headers,
  });
}

describe("POST /api/generate-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.userRpc.mockResolvedValue({ data: true, error: null });
    mocks.serviceRpc.mockResolvedValue({ data: true, error: null });
    mocks.generateImage.mockResolvedValue({
      imageUrl: "https://cdn/img.png",
      enhancedPrompt: "enhanced",
    });
  });

  it("rejects unauthenticated callers before touching coins", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("does not charge a coin for an invalid request", async () => {
    const response = await POST(request({ prompt: "" }));

    expect(response.status).toBe(400);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("deducts a coin as the caller before generating", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.userRpc).toHaveBeenCalledWith("deduct_coin", {
      user_id: "user-1",
    });
    expect(mocks.userRpc.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.generateImage.mock.invocationCallOrder[0],
    );
    expect(mocks.serviceRpc).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({
      success: true,
      imageUrl: "https://cdn/img.png",
    });
  });

  it("returns 402 INSUFFICIENT_COINS and does not generate when balance is empty", async () => {
    mocks.userRpc.mockResolvedValue({ data: false, error: null });

    const response = await POST(request());

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: "INSUFFICIENT_COINS" });
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("returns 500 when the deduction RPC errors", async () => {
    mocks.userRpc.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("refunds the coin with the service role when generation fails", async () => {
    mocks.generateImage.mockRejectedValue(new Error("moderation_blocked"));

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.serviceRpc).toHaveBeenCalledWith("refund_coin", {
      p_user_id: "user-1",
    });
    const body = await response.json();
    expect(body.error).toMatch(/content moderation/);
  });

  it("rejects an oversized request from the content-length header before parsing", async () => {
    const response = await POST(
      request({ headers: { "content-length": String(MAX_IMAGE_BYTES * 2) } }),
    );

    expect(response.status).toBe(413);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("rejects an image larger than the upload limit without charging", async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(PNG_MAGIC);
    const response = await POST(
      request({ image: new File([big], "big.png", { type: "image/png" }) }),
    );

    expect(response.status).toBe(413);
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("rejects a prompt over the length cap", async () => {
    const response = await POST(request({ prompt: "x".repeat(2001) }));

    expect(response.status).toBe(400);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("ignores the client-supplied MIME type and rejects non-image bytes", async () => {
    const response = await POST(
      request({
        image: new File([NOT_AN_IMAGE], "evil.png", { type: "image/png" }),
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/Unsupported image type/);
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("rejects a file too short to identify even when labelled as an image", async () => {
    const response = await POST(
      request({
        image: new File([new Uint8Array(1)], "tiny.png", { type: "image/png" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it.each([
    ["image/jpeg", JPEG_MAGIC],
    ["image/webp", WEBP_MAGIC],
    ["image/png", PNG_MAGIC],
  ])("forwards the sniffed type %s regardless of the declared type", async (expected, bytes) => {
    const response = await POST(
      request({
        image: new File([bytes], "ref.bin", { type: "application/pdf" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.generateImage).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      expected,
      "a cat astronaut",
      50,
      true,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("does not log the raw prompt or filename", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const prompt = "SECRET PROMPT TEXT";

    await POST(
      request({
        prompt,
        image: new File([PNG_MAGIC], "SECRET-FILENAME.png", { type: "image/png" }),
      }),
    );

    const logged = JSON.stringify(log.mock.calls);
    expect(logged).not.toContain(prompt);
    expect(logged).not.toContain("SECRET-FILENAME");
  });

  it("maps an upstream timeout to a retryable message and refunds the coin", async () => {
    const timeoutError = new Error("The operation was aborted");
    timeoutError.name = "TimeoutError";
    mocks.generateImage.mockRejectedValue(timeoutError);

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/took too long/);
    expect(mocks.serviceRpc).toHaveBeenCalledWith("refund_coin", {
      p_user_id: "user-1",
    });
  });

  it("still returns the generation error when the refund itself fails", async () => {
    mocks.generateImage.mockRejectedValue(new Error("upstream down"));
    mocks.serviceRpc.mockResolvedValue({
      data: null,
      error: { message: "refund failed" },
    });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.serviceRpc).toHaveBeenCalledTimes(1);
  });
});
