"use client";

import { useEffect, useRef } from "react";
import { AuthService } from "@/shared/services/authService";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

/**
 * A guest tried to link a Google account that already belongs to a user:
 * sign in to that account instead. The pending guest claim saved before the
 * link attempt is merged once the session arrives (useMergeGuestCart).
 */
export function useGoogleSignInFallback(): void {
  const { handleError } = useErrorHandler();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    AuthService.signInWithGoogle().catch((error: unknown) => handleError(error));
  }, [handleError]);
}
