"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/shared/services/authService";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

/**
 * A guest tried to link a Google account that already belongs to a user:
 * sign in to that account instead. The pending guest claim saved before the
 * link attempt is merged once the session arrives (useMergeGuestCart).
 */
export function useGoogleSignInFallback(): void {
  const { handleError } = useErrorHandler();
  const { mutate: signInWithGoogle, isIdle } = useMutation({
    mutationFn: () => AuthService.signInWithGoogle(),
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
}
