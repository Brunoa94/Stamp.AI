import { CreditCard, Building2 } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type PaymentMethodId = "stripe" | "paypal" | "mollie";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  Icon: LucideIcon | IconType;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "stripe",
    label: "Credit Card",
    description: "Visa, Mastercard, Amex",
    Icon: CreditCard,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "PayPal, Venmo, Pay Later",
    Icon: FaPaypal,
  },
  {
    id: "mollie",
    label: "Mollie",
    description: "iDEAL, Bancontact, SOFORT, Cards",
    Icon: Building2,
  },
];

export interface PaymentConfirmMethodUi {
  labelDesktop: string;
  labelMobile: string;
  className: string;
  Icon: LucideIcon | IconType;
}

export interface PaymentBrandStyleUi {
  border: string;
  bg: string;
  icon: string;
  check: string;
}

export const PAYMENT_BRAND_STYLES: Record<
  PaymentMethodId,
  PaymentBrandStyleUi
> = {
  stripe: {
    border: "border-[#635BFF]",
    bg: "bg-[#635BFF]/5 hover:bg-[#635BFF]/10",
    icon: "text-[#635BFF]",
    check: "bg-[#635BFF]",
  },
  paypal: {
    border: "border-[#0070BA]",
    bg: "bg-[#0070BA]/5 hover:bg-[#0070BA]/10",
    icon: "text-[#0070BA]",
    check: "bg-[#0070BA]",
  },
  mollie: {
    border: "border-black",
    bg: "bg-black/5 hover:bg-black/10",
    icon: "text-black",
    check: "bg-black",
  },
};

export const PAYMENT_CONFIRM_METHOD_UI: Record<
  PaymentMethodId,
  PaymentConfirmMethodUi
> = {
  stripe: {
    labelDesktop: "Confirm Order • Pay with Card",
    labelMobile: "Confirm Order • Card",
    className: "bg-[#635BFF] hover:bg-[#5548E8]",
    Icon: CreditCard,
  },
  paypal: {
    labelDesktop: "Confirm Order • Pay with PayPal",
    labelMobile: "Confirm Order • PayPal",
    className: "bg-[#0070BA] hover:bg-[#005EA6]",
    Icon: FaPaypal,
  },
  mollie: {
    labelDesktop: "Confirm Order • Pay with Mollie",
    labelMobile: "Confirm Order • Mollie",
    className: "bg-black hover:bg-slate-900",
    Icon: Building2,
  },
};

export const STRIPE_CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      fontFamily: "inherit",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};
