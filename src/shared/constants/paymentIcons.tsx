/**
 * Payment Method Icons
 *
 * Image-based icons for payment providers displayed in the payment methods section.
 * Uses actual brand images from payment-options/ on the static-assets CDN for accurate representation.
 */

import Image from "next/image";
import type { ReactNode } from "react";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

interface PaymentIcon {
  id: string;
  label: string;
  icon: ReactNode;
}

const LOGOS = staticAssetUrl("/payment-options");

export const PAYMENT_ICONS: PaymentIcon[] = [
  {
    id: "visa",
    label: "Visa",
    icon: (
      <Image
        src={`${LOGOS}/visa.png`}
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
        src={`${LOGOS}/mastercard.webp`}
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
        src={`${LOGOS}/amex.png`}
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
        src={`${LOGOS}/paypal.png`}
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
        src={`${LOGOS}/ideal.webp`}
        alt="iDEAL"
        width={56}
        height={32}
        className="h-10 w-auto object-contain"
      />
    ),
  },
];
