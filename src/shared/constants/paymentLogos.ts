import type { PaymentMethodId } from "./payment";

export type PaymentLogoIdT = "visa" | "mastercard" | "amex" | "paypal" | "ideal";

export type PaymentLogoT = {
  id: PaymentLogoIdT;
  label: string;
  /** Full-colour brand mark in /public/payment-options, trimmed to its edges */
  src: string;
  width: number;
  height: number;
};

export const PAYMENT_LOGOS: Record<PaymentLogoIdT, PaymentLogoT> = {
  visa: { id: "visa", label: "Visa", src: "/payment-options/visa.png", width: 1920, height: 622 },
  mastercard: {
    id: "mastercard",
    label: "Mastercard",
    src: "/payment-options/mastercard-mark.webp",
    width: 256,
    height: 160,
  },
  amex: { id: "amex", label: "American Express", src: "/payment-options/amex-card.webp", width: 400, height: 400 },
  paypal: {
    id: "paypal",
    label: "PayPal",
    src: "/payment-options/paypal-wordmark.webp",
    width: 488,
    height: 140,
  },
  ideal: { id: "ideal", label: "iDEAL", src: "/payment-options/ideal.webp", width: 256, height: 256 },
};

/** The brands each checkout payment option accepts, in display order */
export const PAYMENT_METHOD_LOGOS: Record<PaymentMethodId, readonly PaymentLogoIdT[]> = {
  stripe: ["visa", "mastercard", "amex"],
  paypal: ["paypal"],
  ideal: ["ideal"],
};

/** Every brand the checkout accepts */
export const ACCEPTED_PAYMENT_LOGOS: readonly PaymentLogoIdT[] = [
  "visa",
  "mastercard",
  "amex",
  "paypal",
  "ideal",
];
