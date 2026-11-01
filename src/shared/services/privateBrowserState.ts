/** Clear account-specific state without removing the visitor's consent choices. */
export function clearPrivateBrowserState(): void {
  if (typeof window === "undefined") return;
  const keys = [
    "stamp:generated-images", "stripe_checkout_data", "paypal_checkout_data",
    "guest_products", "local_cart", "guest_session_id", "stamp:pending-guest-claim",
  ];
  for (const key of keys) {
    try { window.localStorage.removeItem(key); } catch { /* Storage can be unavailable. */ }
  }
  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index--) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith("mollie_")) window.sessionStorage.removeItem(key);
    }
  } catch { /* Storage can be unavailable. */ }
}

const OWNER_KEY = "stamp:storage-owner";
const OWNER_ANONYMOUS_KEY = "stamp:storage-owner-anonymous";

/**
 * Called on every auth state change. Clears private state when the browser
 * changes hands (sign-out, a first sign-in, or a different user), except
 * when a guest's anonymous session becomes a registered account: that is the
 * same person, and their local cart must survive until it is merged.
 */
export function syncPrivateBrowserStateOwner(
  event: string,
  user: { id: string; is_anonymous?: boolean } | null,
): void {
  try {
    const previousOwner = window.localStorage.getItem(OWNER_KEY);
    const previousWasGuest = window.localStorage.getItem(OWNER_ANONYMOUS_KEY) === "1";
    const nextOwner = user?.id ?? null;
    const guestLoggedIn = previousWasGuest && !!user && !user.is_anonymous;

    const ownerChanged = (nextOwner && !previousOwner) ||
      (previousOwner && previousOwner !== nextOwner);
    if (event === "SIGNED_OUT" || (ownerChanged && !guestLoggedIn)) {
      clearPrivateBrowserState();
    }

    if (nextOwner) {
      window.localStorage.setItem(OWNER_KEY, nextOwner);
      window.localStorage.setItem(OWNER_ANONYMOUS_KEY, user?.is_anonymous ? "1" : "0");
    } else {
      window.localStorage.removeItem(OWNER_KEY);
      window.localStorage.removeItem(OWNER_ANONYMOUS_KEY);
    }
  } catch { /* Storage may be unavailable. */ }
}
