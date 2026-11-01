"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { mergeGuestCartIntoAccount } from "@/shared/services/guestCartMergeService";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import { GuestClaimExpiredError } from "@/shared/errors/GuestClaimExpiredError";
import { captureError } from "@/lib/observability/errorCapture";

/** Moves a guest's products and local cart into the account they logged in to. */
export function useMergeGuestCartMutation() {
  const t = useTranslations("auth.errors");
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: mergeGuestCartIntoAccount,
    // Merges run one after another: a second one (Strict Mode, a re-render
    // before isIdle updates) finds the bag already merged and does nothing.
    scope: { id: "merge-guest-cart" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      captureError(error, { service: "Auth", action: "mergeGuestCart" });

      const message = error instanceof GuestClaimExpiredError ? "guestClaimExpired" : "guestClaim";

      handleError(new UserFacingError(t(message)));
    },
  });
}
