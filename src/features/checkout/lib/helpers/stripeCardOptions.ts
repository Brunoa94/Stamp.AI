import type { StripeCardElementOptions } from "@stripe/stripe-js";

/**
 * Build Stripe CardElement style options from the live stamp design tokens.
 *
 * Stripe's CardElement renders inside a cross-origin iframe that cannot read
 * the page's CSS custom properties, so its colors must be passed as literal
 * values. Reading them from the tokens at runtime (rather than hardcoding hex)
 * keeps the card input in sync with the luxury palette.
 */
export function buildCardElementOptions(): StripeCardElementOptions {
  if (typeof document === "undefined") {
    return { style: { base: { fontSize: "16px", fontFamily: "inherit" } } };
  }
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim() || undefined;
  return {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: "inherit",
        color: token("--color-stamp-chocolate"),
        "::placeholder": { color: token("--color-stamp-taupe") },
      },
      invalid: { color: token("--color-stamp-error") },
    },
  };
}
