"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/shared/queries/authQueries";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import {
  hasGuestCartToMerge,
  mergeGuestCartIntoAccount,
} from "@/shared/services/guestCartMergeService";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import { captureError } from "@/lib/observability/errorCapture";

/**
 * Once a registered session appears (email login, a confirmed sign-up or the
 * Google callback), moves the guest's products and local cart into the
 * account. Mounted once for the whole app.
 */
export function useMergeGuestCart(): void {
  const t = useTranslations("auth.errors");
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const isMerging = useRef(false);

  useEffect(() => {
    if (!isRegisteredUser(user) || isMerging.current || !hasGuestCartToMerge()) {
      return;
    }

    isMerging.current = true;
    mergeGuestCartIntoAccount(user)
      .then(() => queryClient.invalidateQueries({ queryKey: ["cart"] }))
      .catch((error: unknown) => {
        captureError(error, { service: "Auth", action: "mergeGuestCart" });
        handleError(new UserFacingError(t("guestClaim")));
      })
      .finally(() => {
        isMerging.current = false;
      });
  }, [user, queryClient, handleError, t]);
}
