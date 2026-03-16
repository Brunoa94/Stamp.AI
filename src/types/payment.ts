/**
 * Payment method selection type
 * Used to toggle between Stripe (credit card) and PayPal payment methods
 */
export type PaymentMethodT = "stripe" | "paypal";

/**
 * Payment method option for UI display
 */
export interface PaymentMethodOptionI {
  id: PaymentMethodT;
  label: string;
  icon: string;
  description?: string;
}

/**
 * PayPal button actions interface
 * Used for createOrder and onApprove callbacks
 */
export interface PayPalButtonActionsI {
  order: {
    create: () => Promise<string>;
    capture: () => Promise<unknown>;
  };
}

/**
 * PayPal onApprove data interface
 */
export interface PayPalOnApproveDataI {
  orderID: string;
  payerID?: string | null;
  facilitatorAccessToken?: string;
}

/**
 * Payment success details for both Stripe and PayPal
 */
export interface PaymentSuccessDetailsI {
  id: string;
  provider: PaymentMethodT;
  status: string;
  captureId?: string;
  payerEmail?: string;
}

/**
 * Available payment method options
 */
export const PAYMENT_METHOD_OPTIONS: PaymentMethodOptionI[] = [
  {
    id: "stripe",
    label: "Credit Card",
    icon: "creditCard",
    description: "Pay with Visa, Mastercard, or other cards",
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: "paypal",
    description: "Pay with PayPal, Venmo, or Pay Later",
  },
];
