import { describe, expect, it } from "vitest";
import {
  LoginRequestSchema,
  LoginSchema,
  PASSWORD_MIN_LENGTH,
  PasswordResetConfirmSchema,
  UpdatePasswordSchema,
} from "./auth";

/**
 * The new-password minimum mirrors minimum_password_length in
 * supabase/config.toml. Login deliberately only checks presence so accounts
 * created under the previous (6 character) minimum can still sign in.
 */
describe("auth schemas", () => {
  const email = "user@example.com";

  it("exposes an 8 character minimum for new passwords", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  describe.each([
    ["PasswordResetConfirmSchema", PasswordResetConfirmSchema],
    ["UpdatePasswordSchema", UpdatePasswordSchema],
  ])("%s", (_name, schema) => {
    it("rejects a 7 character password with the passwordMin key", () => {
      const result = schema.safeParse({
        password: "abcdefg",
        confirmPassword: "abcdefg",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("passwordMin");
    });

    it("accepts an 8 character password", () => {
      expect(
        schema.safeParse({ password: "abcdefgh", confirmPassword: "abcdefgh" })
          .success,
      ).toBe(true);
    });
  });

  describe.each([
    ["LoginSchema", LoginSchema],
    ["LoginRequestSchema", LoginRequestSchema],
  ])("%s", (_name, schema) => {
    it("still accepts a legacy 6 character password", () => {
      expect(schema.safeParse({ email, password: "abcdef" }).success).toBe(true);
    });

    it("requires a password with the passwordRequired key", () => {
      const result = schema.safeParse({ email, password: "" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("passwordRequired");
    });
  });
});
