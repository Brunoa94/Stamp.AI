"use client";

import { useEffect } from "react";
import { useUser } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { hasGuestCartToMerge } from "@/shared/services/guestCartMergeService";
import { useMergeGuestCartMutation } from "./useMergeGuestCartMutation";

/**
 * Once a registered session appears (email login, a confirmed sign-up or the
 * Google callback), moves the guest's products and local cart into the
 * account. Mounted once for the whole app; one attempt per page load (a
 * failed merge is retried on refresh).
 */
export function useMergeGuestCart(): void {
  const { data: user } = useUser();
  const { mutate: mergeGuestCart, isIdle } = useMergeGuestCartMutation();

  useEffect(() => {
    if (!isRegisteredUser(user) || !isIdle || !hasGuestCartToMerge()) return;

    mergeGuestCart(user);
  }, [user, isIdle, mergeGuestCart]);
}
