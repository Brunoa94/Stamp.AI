import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuestClaimStorageService } from "./guestClaimStorageService";

const IN_AN_HOUR = () => Date.now() + 60 * 60 * 1000;

describe("GuestClaimStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the anonymous session to claim across a reload", () => {
    const expiresAt = IN_AN_HOUR();
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1", expiresAt });

    expect(GuestClaimStorageService.read()).toEqual({ accessToken: "guest-jwt", userId: "anon-1", expiresAt });
  });

  it("is empty after clear", () => {
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1", expiresAt: IN_AN_HOUR() });

    GuestClaimStorageService.clear();

    expect(GuestClaimStorageService.read()).toBeNull();
  });

  it("can claim only until the anonymous token expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    const claim = {
      accessToken: "guest-jwt",
      userId: "anon-1",
      expiresAt: new Date("2026-11-01T10:05:00Z").getTime(),
    };

    expect(GuestClaimStorageService.isClaimable(claim)).toBe(true);
    vi.setSystemTime(new Date("2026-11-01T10:06:00Z"));
    expect(GuestClaimStorageService.isClaimable(claim)).toBe(false);
  });

  it("drops a record older than the local cart's lifetime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1", expiresAt: IN_AN_HOUR() });

    vi.setSystemTime(new Date("2026-11-09T10:00:00Z"));

    expect(GuestClaimStorageService.read()).toBeNull();
  });

  it("returns null for corrupt data", () => {
    localStorage.setItem("stamp:pending-guest-claim", "{nope");

    expect(GuestClaimStorageService.read()).toBeNull();
  });
});
