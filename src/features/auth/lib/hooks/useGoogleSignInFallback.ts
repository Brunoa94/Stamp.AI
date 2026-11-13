"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/shared/services/authService";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { getSafeRedirectPath } from "@/shared/helpers/redirectTarget";

/**
 * A guest tried to link a Google account that already belongs to a user:
 * sign in to that account instead, returning to the page they started from
 * (`next`). The pending guest claim saved before the link attempt is merged
 * once the session arrives (useMergeGuestCart). Starts once on mount; after
 * a failure the page offers `retry`.
 */
export function useGoogleSignInFallback() {
  const { handleError } = useErrorHandler();
  const next = getSafeRedirectPath(useSearchParams().get("next")) ?? "/stamp";
  const { mutate: signInWithGoogle, isIdle, isError } = useMutation({
    mutationFn: () => AuthService.signInWithGoogle(next),
    // A second start (Strict Mode) waits for the first redirect instead of racing it.
    scope: { id: "google-sign-in-fallback" },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  useEffect(() => {
    if (!isIdle) return;

    signInWithGoogle();
  }, [isIdle, signInWithGoogle]);

  return { isError, retry: () => signInWithGoogle() };
}
