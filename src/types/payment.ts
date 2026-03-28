/**
 * Payment method selection type
 * Used to toggle between Stripe (credit card), PayPal, and Mollie payment methods
 */
export type PaymentMethodT = "stripe" | "paypal" | "mollie";

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
 * Payment success details for both Stripe and PayPal.
 * Includes display-ready fields consumed by the PaymentSuccess UI.
 */
export interface PaymentSuccessDetailsI {
  id: string;
  provider: PaymentMethodT;
  status: string;
  captureId?: string;
  payerEmail?: string;
  // Display fields for the success screen
  orderNumber: string;
  totalPaid: string;
  estimatedDelivery: string;
  confirmationEmail: string;
}

export type PaymentAlternativeMethodT = PaymentMethodT | "applepay";

/**
 * Payment error details for display-ready failed payment UI.
 */
export interface PaymentErrorDetailsI {
  paymentId: string;
  orderNumber: string;
  amountDue: string;
  attemptedOn: string;
  status: string;
  reasonTitle: string;
  reasonMessage: string;
  availableMethods: PaymentAlternativeMethodT[];
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
  {
    id: "mollie",
    label: "Mollie",
    icon: "bank",
    description: "iDEAL, Bancontact, SOFORT, Cards",
  },
];
