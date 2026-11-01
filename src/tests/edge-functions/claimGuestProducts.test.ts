import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * claim-guest-products: after a guest logs in, their products and uploaded
 * Printify images move from the anonymous user to the account, so checkout
 * pricing (which rejects products owned by someone else) accepts them.
 */

type RowT = Record<string, string>;
const db = vi.hoisted(() => ({
  products: [] as RowT[],
  printify_image_owners: [] as RowT[],
  limitAllowed: true,
}));

/** In-memory stand-in for the PostgREST calls the function makes. */
const mockSupabaseRest = vi.hoisted(() =>
  vi.fn(async (endpoint: string, method: string, body?: unknown) => {
    if (endpoint.startsWith("rpc/consume_operation_limit")) {
      return { data: db.limitAllowed, error: null, status: 200 };
    }
    const [table, query = ""] = endpoint.split("?");
    const userId = new URLSearchParams(query).get("user_id")?.replace("eq.", "");
    const rows = db[table as "products" | "printify_image_owners"];
    if (method === "PATCH") {
      const patched = rows.filter((row) => row.user_id === userId);
      for (const row of patched) Object.assign(row, body);
      return { data: patched, error: null, status: 200 };
    }
    if (method === "GET") {
      return { data: rows.filter((row) => row.user_id === userId), error: null, status: 200 };
    }
    if (method === "POST") {
      for (const row of body as RowT[]) {
        const exists = rows.some((r) => r.image_id === row.image_id && r.user_id === row.user_id);
        if (!exists) rows.push({ ...row });
      }
      return { data: null, error: null, status: 201 };
    }
    if (method === "DELETE") {
      db[table as "printify_image_owners"] = rows.filter((row) => row.user_id !== userId);
      return { data: null, error: null, status: 204 };
    }
    throw new Error(`unexpected ${method} ${endpoint}`);
  }),
);

vi.mock("../../../supabase/functions/_shared/supabase.ts", () => ({
  supabaseRest: mockSupabaseRest,
}));

const { handleClaimGuestProducts } = await import(
  "../../../supabase/functions/claim-guest-products/handler"
);

const ENV: Record<string, string> = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
};

/** Users the auth endpoint knows, by access token. */
const USERS: Record<string, { id: string; is_anonymous: boolean }> = {
  "account-jwt": { id: "user-1", is_anonymous: false },
  "guest-jwt": { id: "anon-1", is_anonymous: true },
  "other-account-jwt": { id: "user-2", is_anonymous: false },
};

function claim(callerToken: string, body: unknown) {
  return handleClaimGuestProducts(
    new Request("https://fn/claim-guest-products", {
      method: "POST",
      headers: { authorization: `Bearer ${callerToken}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  db.products = [
    { id: "prod-1", user_id: "anon-1" },
    { id: "prod-2", user_id: "anon-1" },
    { id: "prod-3", user_id: "user-2" },
  ];
  db.printify_image_owners = [
    { image_id: "img-1", user_id: "anon-1" },
    { image_id: "img-2", user_id: "anon-1" },
    { image_id: "img-2", user_id: "user-1" },
  ];
  db.limitAllowed = true;
  vi.stubGlobal("Deno", { env: { get: (key: string) => ENV[key] } });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const token = String((init.headers as Record<string, string>).Authorization).slice(7);
      const user = USERS[token];
      return user
        ? new Response(JSON.stringify(user), { status: 200 })
        : new Response("{}", { status: 401 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockSupabaseRest.mockClear();
});

describe("claim-guest-products", () => {
  it("moves the anonymous user's products and image ownership to the caller", async () => {
    const response = await claim("account-jwt", { anonymousAccessToken: "guest-jwt" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, products: 2, images: 2 });
    expect(db.products).toEqual([
      { id: "prod-1", user_id: "user-1" },
      { id: "prod-2", user_id: "user-1" },
      { id: "prod-3", user_id: "user-2" },
    ]);
    expect(db.printify_image_owners).toEqual([
      { image_id: "img-2", user_id: "user-1" },
      { image_id: "img-1", user_id: "user-1" },
    ]);
  });

  it("refuses when the source user is not anonymous", async () => {
    const response = await claim("account-jwt", { anonymousAccessToken: "other-account-jwt" });

    expect(response.status).toBe(403);
    expect(db.products.find((row) => row.id === "prod-3")?.user_id).toBe("user-2");
  });

  it("refuses an invalid guest token", async () => {
    const response = await claim("account-jwt", { anonymousAccessToken: "expired-jwt" });

    expect(response.status).toBe(400);
    expect(db.products.filter((row) => row.user_id === "user-1")).toEqual([]);
  });

  it("refuses an anonymous caller", async () => {
    const response = await claim("guest-jwt", { anonymousAccessToken: "guest-jwt" });

    expect(response.status).toBe(403);
    expect(db.products.filter((row) => row.user_id === "anon-1")).toHaveLength(2);
  });

  it("refuses a request without a guest token", async () => {
    const response = await claim("account-jwt", {});

    expect(response.status).toBe(400);
  });

  it("refuses an invalid caller token", async () => {
    const response = await claim("bogus", { anonymousAccessToken: "guest-jwt" });

    expect(response.status).toBe(401);
  });

  it("returns 429 when the caller exceeds 5 claims a minute", async () => {
    db.limitAllowed = false;

    const response = await claim("account-jwt", { anonymousAccessToken: "guest-jwt" });

    expect(response.status).toBe(429);
    expect(mockSupabaseRest).toHaveBeenCalledWith(
      "rpc/consume_operation_limit",
      "POST",
      expect.objectContaining({ p_user_id: "user-1", p_limit: 5, p_seconds: 60 }),
    );
  });
});
