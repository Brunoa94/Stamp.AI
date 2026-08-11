import { CreditCard, Landmark } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type PaymentMethodId = "stripe" | "paypal" | "ideal";

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
    id: "ideal",
    label: "iDEAL",
    description: "Pay with your Dutch bank",
    Icon: Landmark,
  },
];

/**
 * iDEAL runs through Mollie, which needs MOLLIE_API_KEY configured in the
 * Supabase edge-function secrets. The flag lets environments without that
 * setup hide iDEAL from the checkout selector.
 */
export const IDEAL_PAYMENT_ENABLED =
  process.env.NEXT_PUBLIC_MOLLIE_ENABLED === "true";

/**
 * Payment methods offered in the checkout selector.
 */
export const CHECKOUT_PAYMENT_METHODS: PaymentMethodOption[] =
  IDEAL_PAYMENT_ENABLED
    ? PAYMENT_METHODS
    : PAYMENT_METHODS.filter((method) => method.id !== "ideal");

/**
 * Payment methods available for credit purchases.
 * The create-credit-payment flow does not support iDEAL, so it is excluded here.
 */
export const CREDIT_PAYMENT_METHODS: PaymentMethodOption[] =
  PAYMENT_METHODS.filter((method) => method.id !== "ideal");

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
  ideal: {
    labelDesktop: "Confirm Order • Pay with iDEAL",
    labelMobile: "Confirm Order • iDEAL",
    className: "bg-[#CC0066] hover:bg-[#B3005C]",
    Icon: Landmark,
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
