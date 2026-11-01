/** Query parameter the middleware sets when it bounces a guest off a protected page. */
export const REDIRECTED_FROM_PARAM = "redirectedFrom";

/**
 * Returns the path to continue to after login, or null when the value is not
 * a same-origin path. Rejecting anything else keeps `redirectedFrom` from
 * becoming an open redirect.
 */
export function getSafeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  try {
    const url = new URL(value, "https://same-origin.invalid");
    if (url.origin !== "https://same-origin.invalid") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
