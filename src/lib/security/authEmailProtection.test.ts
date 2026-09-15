import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { isAuthEmailRequestAllowed } from "./authEmailProtection";

describe("isAuthEmailRequestAllowed", () => {
  it("checks hashed IP and email identifiers in the shared store", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const request = new NextRequest("https://stamp.ai/api/auth/signup", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    await expect(isAuthEmailRequestAllowed(
      client,
      request,
      "signup",
      "User@Example.com",
    )).resolves.toBe(true);

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("203.0.113.10");
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("user@example.com");
  });

  it("does not consume an email quota after the IP quota is exhausted", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;

    const allowed = await isAuthEmailRequestAllowed(
      client,
      new NextRequest("https://stamp.ai/api/auth/signup"),
      "signup",
      "user@example.com",
    );

    expect(allowed).toBe(false);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
