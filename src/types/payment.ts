import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "./printifyOrder";
import type { MolliePaymentStatus } from "@/lib/mollie";

/**
 * Payment method selection type
 * Used to toggle between Stripe (credit card) and PayPal payment methods
 */
export type PaymentMethodT = "stripe" | "paypal";

/**
 * Legacy payment method type including Mollie
 * Used for backward compatibility with existing payments and refunds
 * @deprecated Use PaymentMethodT for new payment flows
 */
export type LegacyPaymentMethodT = "stripe" | "paypal" | "mollie";

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
  /**
   * Indicates whether this error occurred after payment was successfully captured.
   * When true, the payment went through but order fulfillment failed (e.g., database error, Printify error).
   * This prevents showing retry/alternative payment options since the customer was already charged.
   */
  isPostPaymentError?: boolean;
}

/**
 * Result returned by a payment execution flow (Stripe/PayPal/Mollie)
 */
export interface PaymentExecutionResult {
  provider: PaymentMethodT;
  // Primary payment identifier (payment intent id / mollie id / charge id)
  paymentId: string;
  // Optional capture id for PayPal
  captureId?: string;
  // Optional raw provider payload
  raw?: Record<string, unknown>;
}

// ============================================
// Stripe Payment Types
// ============================================

/**
 * Payload for creating a Stripe payment for credit purchase
 */
export interface CreateCreditPaymentPayloadI {
  amount: number;
  credits: number;
  currency?: string;
}

/**
 * Response from creating a Stripe credit payment
 */
export interface CreateCreditPaymentResponseI {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Payload for creating a Stripe Payment Intent for checkout
 */
export interface CreatePaymentIntentPayloadI {
  amount: number;
  currency?: string;
  line_items: PrintifyLineItem[];
  shipping_address: ShippingAddressT;
  metadata?: Record<string, unknown>;
  payment_method?: string;
  confirm?: boolean;
}

/**
 * Response from creating a Stripe Payment Intent
 */
export interface CreatePaymentIntentResponseI {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

// ============================================
// PayPal Payment Types
// ============================================

/**
 * Payload for creating a PayPal order
 */
export interface CreatePayPalOrderPayloadI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
}

/**
 * Response from creating a PayPal order
 */
export interface CreatePayPalOrderResponseI {
  orderId: string;
  approvalUrl?: string;
}

/**
 * Payload for capturing a PayPal order
 */
export interface CapturePayPalOrderPayloadI {
  orderId: string;
  payerId?: string | null;
}

/**
 * Response from capturing a PayPal order
 */
export interface CapturePayPalOrderResponseI {
  success: boolean;
  captureId: string;
  payerEmail?: string;
}

// ============================================
// Mollie Payment Types
// ============================================

/**
 * Payload for creating a Mollie payment
 */
export interface CreateMolliePaymentPayloadI {
  amount: number;
  currency?: string;
  description?: string;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
}

/**
 * Response from creating a Mollie payment
 */
export interface CreateMolliePaymentResponseI {
  paymentId: string;
  checkoutUrl: string;
}

/**
 * Payload for verifying a Mollie payment
 */
export interface VerifyMolliePaymentPayloadI {
  paymentId: string;
}

/**
 * Response from verifying a Mollie payment
 */
export interface VerifyMolliePaymentResponseI {
  paymentId: string;
  status: MolliePaymentStatus;
  isPaid: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================
// Payment Method Options
// ============================================

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
