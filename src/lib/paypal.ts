import type { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

/**
 * PayPal Client ID from environment variable
 * This is the public client ID that can be exposed to the frontend
 */
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

/**
 * Check if PayPal is configured
 */
export const isPayPalConfigured = (): boolean => {
  return Boolean(PAYPAL_CLIENT_ID);
};

/**
 * PayPal Script Provider options
 * These options configure the PayPal SDK initialization
 */
export const paypalScriptOptions: ReactPayPalScriptOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  components: "buttons,funding-eligibility",
  // Enable additional funding sources
  enableFunding: "venmo,paylater",
  // Disable specific funding sources if needed
  // disableFunding: "credit",
};

/**
 * PayPal button style options
 */
export const paypalButtonStyles = {
  layout: "vertical" as const,
  color: "blue" as const,
  shape: "rect" as const,
  label: "paypal" as const,
  height: 48,
};

/**
 * PayPal button style options for horizontal layout (inline with other buttons)
 */
export const paypalButtonStylesHorizontal = {
  layout: "horizontal" as const,
  color: "blue" as const,
  shape: "rect" as const,
  label: "paypal" as const,
  height: 48,
  tagline: false,
};
