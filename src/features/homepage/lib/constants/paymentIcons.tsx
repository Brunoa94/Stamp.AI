/**
 * Payment Method Icons
 *
 * Image-based icons for payment providers displayed in the payment methods section.
 * Uses actual brand images from /public/payment-options/ for accurate representation.
 */

import Image from "next/image";
import type { ReactNode } from "react";

interface PaymentIcon {
  id: string;
  label: string;
  icon: ReactNode;
}

export const PAYMENT_ICONS: PaymentIcon[] = [
  {
    id: "visa",
    label: "Visa",
    icon: (
      <Image
        src="/payment-options/visa.png"
        alt="Visa"
        width={56}
        height={32}
        className="h-6 w-auto object-contain"
      />
    ),
  },
  {
    id: "mastercard",
    label: "Mastercard",
    icon: (
      <Image
        src="/payment-options/mastercard.webp"
        alt="Mastercard"
        width={56}
        height={32}
        className="h-10 w-auto object-contain"
      />
    ),
  },
  {
    id: "amex",
    label: "American Express",
    icon: (
      <Image
        src="/payment-options/amex.png"
        alt="American Express"
        width={56}
        height={32}
        className="h-10 w-auto object-contain"
      />
    ),
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: (
      <Image
        src="/payment-options/paypal.png"
        alt="PayPal"
        width={56}
        height={32}
        className="h-10 w-auto object-contain"
      />
    ),
  },
  {
    id: "ideal",
    label: "iDEAL",
    icon: (
      <Image
        src="/payment-options/ideal.webp"
        alt="iDEAL"
        width={56}
        height={32}
        className="h-10 w-auto object-contain"
      />
    ),
  },
];
