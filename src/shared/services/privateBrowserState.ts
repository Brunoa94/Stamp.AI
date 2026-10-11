/** Clear account-specific state without removing the visitor's consent choices. */
export function clearPrivateBrowserState(): void {
  if (typeof window === "undefined") return;
  const keys = [
    "stamp:generated-images", "stripe_checkout_data", "paypal_checkout_data",
    "guest_products", "local_cart", "guest_session_id",
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
