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

const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function request(fields: { prompt?: string; image?: File | null } = {}) {
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
  });
}

describe("POST /api/generate-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.userRpc.mockResolvedValue({ data: true, error: null });
    mocks.serviceRpc.mockResolvedValue({ data: "debit-1", error: null });
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

  it("rejects an anonymous (guest) session before debiting a credit", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "anon-1", is_anonymous: true } },
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.serviceRpc).not.toHaveBeenCalled();
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("does not charge a coin for an invalid request", async () => {
    const response = await POST(request({ prompt: "" }));

    expect(response.status).toBe(400);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("reserves a server credit receipt before generating", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.serviceRpc).toHaveBeenCalledWith("spend_generation_credit", {
      p_user_id: "user-1",
    });
    expect(mocks.serviceRpc.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.generateImage.mock.invocationCallOrder[0],
    );
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({
      success: true,
      imageUrl: "https://cdn/img.png",
    });
  });

  it("returns 402 INSUFFICIENT_COINS and does not generate when balance is empty", async () => {
    mocks.serviceRpc.mockResolvedValue({ data: null, error: null });

    const response = await POST(request());

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: "INSUFFICIENT_COINS" });
    expect(mocks.generateImage).not.toHaveBeenCalled();
  });

  it("returns 500 when the deduction RPC errors", async () => {
    mocks.serviceRpc.mockResolvedValueOnce({
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

    expect(response.status).toBe(422);
    expect(mocks.serviceRpc).toHaveBeenCalledWith("refund_generation_credit", {
      p_debit_id: "debit-1",
    });
    const body = await response.json();
    expect(body.error).toMatch(/content moderation/);
  });

  it("rejects an image whose bytes are not PNG, JPEG or WebP before charging", async () => {
    const svg = new File([new TextEncoder().encode("<svg xmlns='x'/>")], "ref.png", { type: "image/png" });

    const response = await POST(request({ image: svg }));

    expect(response.status).toBe(415);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("rejects an image over 10 MB before charging", async () => {
    const big = new File([PNG_MAGIC, new Uint8Array(10 * 1024 * 1024)], "big.png", { type: "image/png" });

    const response = await POST(request({ image: big }));

    expect(response.status).toBe(413);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("never echoes provider error details in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.generateImage.mockRejectedValue(new Error("upstream secret detail"));

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret detail");
    vi.unstubAllEnvs();
  });

  it("still returns the generation error when the refund itself fails", async () => {
    mocks.generateImage.mockRejectedValue(new Error("upstream down"));
    mocks.serviceRpc.mockResolvedValueOnce({ data: "debit-1", error: null }).mockResolvedValueOnce({
      data: null,
      error: { message: "refund failed" },
    });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.serviceRpc).toHaveBeenCalledTimes(2);
  });
});
