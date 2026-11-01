import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuestClaimStorageService } from "./guestClaimStorageService";

describe("GuestClaimStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the anonymous session to claim across a reload", () => {
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1" });

    expect(GuestClaimStorageService.read()).toEqual({ accessToken: "guest-jwt", userId: "anon-1" });
  });

  it("is empty after clear", () => {
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1" });

    GuestClaimStorageService.clear();

    expect(GuestClaimStorageService.read()).toBeNull();
  });

  it("drops a claim older than the anonymous token's lifetime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1" });

    vi.setSystemTime(new Date("2026-11-01T11:01:00Z"));

    expect(GuestClaimStorageService.read()).toBeNull();
  });

  it("returns null for corrupt data", () => {
    localStorage.setItem("stamp:pending-guest-claim", "{nope");

    expect(GuestClaimStorageService.read()).toBeNull();
  });
});
