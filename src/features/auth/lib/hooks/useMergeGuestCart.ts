"use client";

import { useEffect } from "react";
import { useUser } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { hasGuestCartToMerge } from "@/shared/services/guestCartMergeService";
import { useMergeGuestCartMutation } from "./useMergeGuestCartMutation";

/**
 * Once a registered session appears (email login, a confirmed sign-up or the
 * Google callback), moves the guest's products and local cart into the
 * account. Mounted once for the whole app; one attempt per login (a failed
 * merge is retried on refresh). Logging out resets the attempt: a guest can
 * bag new products and log in again without a page load in between.
 */
export function useMergeGuestCart(): void {
  const { data: user } = useUser();
  const { mutate: mergeGuestCart, isIdle, reset } = useMergeGuestCartMutation();

  useEffect(() => {
    if (!isRegisteredUser(user)) {
      if (!isIdle) reset();
      return;
    }
    if (!isIdle || !hasGuestCartToMerge()) return;

    mergeGuestCart(user);
  }, [user, isIdle, mergeGuestCart, reset]);
}
