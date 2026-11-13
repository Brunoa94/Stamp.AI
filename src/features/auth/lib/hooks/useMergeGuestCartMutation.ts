"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import { GuestClaimExpiredError } from "@/shared/errors/GuestClaimExpiredError";

/** Moves a guest's products and local cart into the account they logged in to. */
export function useMergeGuestCartMutation() {
  const t = useTranslations("auth.errors");
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    // Loaded on demand: the merger is mounted on every page, but only a guest
    // who just logged in needs the cart service behind it.
    mutationFn: async (account: { id: string; email?: string }) => {
      const { mergeGuestCartIntoAccount } = await import("@/shared/services/guestCartMergeService");
      await mergeGuestCartIntoAccount(account);
    },
    // Merges run one after another: a second one (Strict Mode, a re-render
    // before isIdle updates) finds the bag already merged and does nothing.
    scope: { id: "merge-guest-cart" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      const message = error instanceof GuestClaimExpiredError ? "guestClaimExpired" : "guestClaim";

      // handleError reports to Sentry; the cause keeps the original stack.
      handleError(new UserFacingError(t(message), { cause: error }));
    },
  });
}
