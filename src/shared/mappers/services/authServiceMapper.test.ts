import { describe, expect, it } from "vitest";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AuthServiceMapper } from "./authServiceMapper";

function supabaseUser(overrides: Partial<SupabaseUser>): SupabaseUser {
  return {
    id: "user-1",
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-10-01T00:00:00Z",
    ...overrides,
  };
}

describe("AuthServiceMapper.mapSupabaseUserToUser", () => {
  it("keeps the is_anonymous flag of an anonymous user", () => {
    const user = AuthServiceMapper.mapSupabaseUserToUser(
      supabaseUser({ is_anonymous: true }),
    );

    expect(user.is_anonymous).toBe(true);
  });

  it("marks a user without the flag as not anonymous", () => {
    const user = AuthServiceMapper.mapSupabaseUserToUser(
      supabaseUser({ email: "a@b.c" }),
    );

    expect(user.is_anonymous).toBe(false);
  });
});
