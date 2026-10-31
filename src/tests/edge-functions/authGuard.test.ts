import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, requireUser } from "../../../supabase/functions/_shared/authGuard";
import { verifyAuth } from "../../../supabase/functions/_shared/validators";

const ENV: Record<string, string> = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
};

function respondWithUser(user: Record<string, unknown>) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(user), { status: 200 }),
  );
}

beforeEach(() => {
  vi.stubGlobal("Deno", { env: { get: (key: string) => ENV[key] } });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requireUser", () => {
  it("returns isAnonymous: true for an anonymous JWT", async () => {
    respondWithUser({ id: "anon-1", is_anonymous: true });

    const caller = await requireUser("Bearer anon-jwt");

    expect(caller).toMatchObject({ userId: "anon-1", isAnonymous: true, isServiceRole: false });
  });

  it("returns isAnonymous: false for a registered user", async () => {
    respondWithUser({ id: "user-1", email: "a@b.c", is_anonymous: false });

    const caller = await requireUser("Bearer user-jwt");

    expect(caller).toMatchObject({ userId: "user-1", isAnonymous: false });
  });

  it("returns isAnonymous: false for the service role", async () => {
    const caller = await requireUser("Bearer service-key");

    expect(caller).toMatchObject({ isServiceRole: true, isAnonymous: false });
  });
});

describe("verifyAuth", () => {
  it("returns isAnonymous: true for an anonymous JWT", async () => {
    respondWithUser({ id: "anon-1", is_anonymous: true });

    const caller = await verifyAuth("Bearer anon-jwt");

    expect(caller).toMatchObject({ userId: "anon-1", isAnonymous: true });
  });

  it("returns isAnonymous: false for a user without the flag", async () => {
    respondWithUser({ id: "user-1", email: "a@b.c" });

    const caller = await verifyAuth("Bearer user-jwt");

    expect(caller).toMatchObject({ userId: "user-1", isAnonymous: false });
  });
});

describe("clientIp", () => {
  it("returns the first x-forwarded-for entry", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" },
    });

    expect(clientIp(req)).toBe("203.0.113.7");
  });

  it("returns unknown when the header is missing or empty", () => {
    expect(clientIp(new Request("http://localhost"))).toBe("unknown");
    expect(
      clientIp(new Request("http://localhost", { headers: { "x-forwarded-for": "" } })),
    ).toBe("unknown");
  });
});
