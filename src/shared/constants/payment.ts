import { CreditCard, Landmark } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type PaymentMethodId = "stripe" | "paypal" | "ideal";

/** Name and description come from the `paymentMethods.<id>` messages */
export interface PaymentMethodOption {
  id: PaymentMethodId;
  Icon: LucideIcon | IconType;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "stripe",
    Icon: CreditCard,
  },
  {
    id: "paypal",
    Icon: FaPaypal,
  },
  {
    id: "ideal",
    Icon: Landmark,
  },
];

/**
 * Payment methods offered in the checkout selector.
 * iDEAL is always enabled (runs through Mollie).
 */
export const CHECKOUT_PAYMENT_METHODS: PaymentMethodOption[] = PAYMENT_METHODS;

/**
 * Payment methods available for credit purchases.
 * The create-credit-payment flow does not support iDEAL, so it is excluded here.
 */
export const CREDIT_PAYMENT_METHODS: PaymentMethodOption[] =
  PAYMENT_METHODS.filter((method) => method.id !== "ideal");

export interface PaymentConfirmMethodUi {
  labelDesktop: string;
  labelMobile: string;
  Icon: LucideIcon | IconType;
}


export const PAYMENT_CONFIRM_METHOD_UI: Record<
  PaymentMethodId,
  PaymentConfirmMethodUi
> = {
  stripe: {
    labelDesktop: "Confirm Order • Pay with Card",
    labelMobile: "Confirm Order • Card",
    Icon: CreditCard,
  },
  paypal: {
    labelDesktop: "Confirm Order • Pay with PayPal",
    labelMobile: "Confirm Order • PayPal",
    Icon: FaPaypal,
  },
  ideal: {
    labelDesktop: "Confirm Order • Pay with iDEAL",
    labelMobile: "Confirm Order • iDEAL",
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
