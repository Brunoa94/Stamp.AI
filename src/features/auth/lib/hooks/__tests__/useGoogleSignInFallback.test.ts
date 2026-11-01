import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGoogleSignInFallback } from "../useGoogleSignInFallback";
import { AuthService } from "@/shared/services/authService";

const mocks = vi.hoisted(() => ({ handleError: vi.fn() }));

vi.mock("@/shared/services/authService");
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mocks.handleError }),
}));

describe("useGoogleSignInFallback", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("signs in to the existing Google account once, without linking again", async () => {
    vi.mocked(AuthService.signInWithGoogle).mockResolvedValue(undefined);

    const { rerender } = renderHook(() => useGoogleSignInFallback());
    rerender();

    await waitFor(() => expect(AuthService.signInWithGoogle).toHaveBeenCalledTimes(1));
    expect(AuthService.linkGoogleIdentity).not.toHaveBeenCalled();
  });

  it("reports a failed sign-in", async () => {
    const failure = new Error("popup blocked");
    vi.mocked(AuthService.signInWithGoogle).mockRejectedValue(failure);

    renderHook(() => useGoogleSignInFallback());

    await waitFor(() => expect(mocks.handleError).toHaveBeenCalledWith(failure));
  });
});
