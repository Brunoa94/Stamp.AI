/**
 * Payment Logos
 *
 * Full-colour brand logos for the payment methods we accept, from
 * /public/payment-options. PAYMENT_METHOD_LOGOS maps each checkout option to
 * the brands it covers; ACCEPTED_PAYMENT_LOGOS is the full "we accept" row.
 */

import type { PaymentLogoT, PaymentMethodT } from "@/shared/types/payment";

const VISA: PaymentLogoT = { id: "visa", label: "Visa", src: "/payment-options/visa.png", width: 62, height: 20 };
const MASTERCARD: PaymentLogoT = { id: "mastercard", label: "Mastercard", src: "/payment-options/mastercard.webp", width: 32, height: 32 };
const AMEX: PaymentLogoT = { id: "amex", label: "American Express", src: "/payment-options/amex.png", width: 32, height: 32 };
const PAYPAL: PaymentLogoT = { id: "paypal", label: "PayPal", src: "/payment-options/paypal.png", width: 32, height: 32 };
const IDEAL: PaymentLogoT = { id: "ideal", label: "iDEAL", src: "/payment-options/ideal.webp", width: 32, height: 32 };

export const PAYMENT_METHOD_LOGOS: Record<PaymentMethodT, PaymentLogoT[]> = {
  stripe: [VISA, MASTERCARD, AMEX],
  paypal: [PAYPAL],
  ideal: [IDEAL],
};

export const ACCEPTED_PAYMENT_LOGOS: PaymentLogoT[] = [VISA, MASTERCARD, AMEX, PAYPAL, IDEAL];
