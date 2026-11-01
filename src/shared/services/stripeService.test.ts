import { describe, it, expect, vi, beforeEach } from "vitest";
import { StripeService } from "./stripeService";
import { AppError } from "./errorClient";
import { createClient } from "@/lib/supabase/client";
import type { CreatePaymentIntentPayloadI } from "@/shared/types/payment";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

vi.mock("./authHelpers", () => ({
  getAuthenticatedHeaders: vi.fn(async () => ({ Authorization: "Bearer test" })),
}));

const payload = {} as CreatePaymentIntentPayloadI;

function functionsHttpError(status: number, body: unknown) {
  return Object.assign(new Error("Edge Function returned a non-2xx status code"), {
    context: new Response(JSON.stringify(body), { status }),
  });
}

describe("StripeService.createPaymentIntent", () => {
  const invoke = vi.fn();

  beforeEach(() => {
    invoke.mockReset();
    vi.mocked(createClient).mockReturnValue({ functions: { invoke } } as never);
  });

  it("keeps the error code the edge function returned", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: functionsHttpError(402, { error: "PAYMENT_DECLINED" }),
    });

    const error = await StripeService.createPaymentIntent(payload).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("PAYMENT_DECLINED");
  });

  it("has no code when the edge function response carries none", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: functionsHttpError(500, "oops"),
    });

    const error = await StripeService.createPaymentIntent(payload).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBeUndefined();
  });
});
