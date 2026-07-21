import { CreditCard } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type PaymentMethodId = "stripe" | "paypal";

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
];

export interface PaymentConfirmMethodUi {
  labelDesktop: string;
  labelMobile: string;
  className: string;
  Icon: LucideIcon | IconType;
}


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
