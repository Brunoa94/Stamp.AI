import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/services/errorClient";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import { useErrorHandler } from "./useErrorHandler";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `translated:${key}`,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

const resolveMessage = (error: unknown) => {
  const { result } = renderHook(() => useErrorHandler({ showToast: false }));
  return result.current.handleError(error).message;
};

describe("useErrorHandler.handleError", () => {
  it("shows the message of a UserFacingError verbatim", () => {
    expect(resolveMessage(new UserFacingError("Please choose a size first."))).toBe(
      "Please choose a size first.",
    );
  });

  it("falls back to the generic message for a UserFacingError without a message", () => {
    expect(resolveMessage(new UserFacingError(""))).toBe("translated:UNKNOWN_ERROR");
  });

  it("shows the translation of a known error code", () => {
    expect(resolveMessage(new AppError("Auth - login failed", "INVALID_CREDENTIALS"))).toBe(
      "translated:INVALID_CREDENTIALS",
    );
  });

  it("finds a known error code embedded in a service message", () => {
    expect(resolveMessage(new Error("AuthService - Login failed: HTTP 400: INVALID_CREDENTIALS"))).toBe(
      "translated:INVALID_CREDENTIALS",
    );
  });

  it("falls back to the generic message for a plain Error's technical message", () => {
    expect(resolveMessage(new Error("CartService - Add failed: HTTP 500: relation \"carts\" does not exist"))).toBe(
      "translated:UNKNOWN_ERROR",
    );
  });

  it("falls back to the generic message for a free-text error field", () => {
    expect(resolveMessage({ error: "duplicate key value violates unique constraint" })).toBe(
      "translated:UNKNOWN_ERROR",
    );
  });

  it("falls back to the generic message for a plain object with a message", () => {
    expect(resolveMessage({ message: "Failed to fetch" })).toBe("translated:UNKNOWN_ERROR");
  });
});
