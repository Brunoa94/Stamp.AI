"use client";

import { useMergeGuestCart } from "../../lib/hooks/useMergeGuestCart";

/** Moves a guest's products and bag into their account after they log in. Renders nothing. */
export function GuestCartMerger() {
  useMergeGuestCart();
  return null;
}
