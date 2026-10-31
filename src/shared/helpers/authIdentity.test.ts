import { describe, expect, it } from "vitest";
import { isRegisteredUser } from "./authIdentity";

describe("isRegisteredUser", () => {
  it("returns false when there is no user", () => {
    expect(isRegisteredUser(null)).toBe(false);
    expect(isRegisteredUser(undefined)).toBe(false);
  });

  it("returns false for an anonymous user", () => {
    expect(isRegisteredUser({ id: "anon-1", is_anonymous: true })).toBe(false);
  });

  it("returns true for a user who signed up", () => {
    expect(isRegisteredUser({ id: "user-1", is_anonymous: false })).toBe(true);
  });

  it("returns true for a user without the is_anonymous flag", () => {
    expect(isRegisteredUser({ id: "user-1" })).toBe(true);
  });
});
