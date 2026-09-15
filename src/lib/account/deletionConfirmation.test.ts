import { describe, expect, it } from "vitest";
import {
  evaluateDeletionConfirmation,
  userHasPasswordIdentity,
} from "./deletionConfirmation";
import { ACCOUNT_DELETION_CONFIRMATION_PHRASE } from "@/schemas/account";

describe("userHasPasswordIdentity", () => {
  it("detects the email provider in app_metadata.providers", () => {
    expect(
      userHasPasswordIdentity({ app_metadata: { providers: ["email"] } }),
    ).toBe(true);
    expect(
      userHasPasswordIdentity({ app_metadata: { providers: ["google"] } }),
    ).toBe(false);
  });

  it("falls back to the singular provider field", () => {
    expect(userHasPasswordIdentity({ app_metadata: { provider: "email" } })).toBe(true);
    expect(userHasPasswordIdentity({ app_metadata: { provider: "apple" } })).toBe(false);
  });

  it("treats missing metadata as no password identity", () => {
    expect(userHasPasswordIdentity({})).toBe(false);
    expect(userHasPasswordIdentity({ app_metadata: null })).toBe(false);
  });
});

describe("evaluateDeletionConfirmation", () => {
  it("rejects a wrong or missing confirmation phrase", () => {
    expect(evaluateDeletionConfirmation({ confirmation: "delete" }, false)).toEqual({
      ok: false,
      error: "CONFIRMATION_PHRASE_MISMATCH",
    });
    expect(
      evaluateDeletionConfirmation(
        { confirmation: "", password: "secret" },
        true,
      ),
    ).toEqual({ ok: false, error: "CONFIRMATION_PHRASE_MISMATCH" });
  });

  it("requires a password when the account has a password identity", () => {
    expect(
      evaluateDeletionConfirmation(
        { confirmation: ACCOUNT_DELETION_CONFIRMATION_PHRASE },
        true,
      ),
    ).toEqual({ ok: false, error: "PASSWORD_REQUIRED" });
  });

  it("asks the route to verify the password for password accounts", () => {
    expect(
      evaluateDeletionConfirmation(
        { confirmation: ` ${ACCOUNT_DELETION_CONFIRMATION_PHRASE} `, password: "secret" },
        true,
      ),
    ).toEqual({ ok: true, verifyPassword: true });
  });

  it("accepts the phrase alone for social sign-in accounts", () => {
    expect(
      evaluateDeletionConfirmation(
        { confirmation: ACCOUNT_DELETION_CONFIRMATION_PHRASE },
        false,
      ),
    ).toEqual({ ok: true, verifyPassword: false });
  });
});
