import type {
  PaymentReturnProviderT,
  PaymentReturnStateI,
} from "../types/paymentReturn";
import type {
  PaymentAlternativeMethodT,
  PaymentMethodT,
} from "@/shared/types/payment";

export const INITIAL_PAYMENT_RETURN_STATE: PaymentReturnStateI = {
  status: "loading",
  paymentId: null,
  orderNumber: null,
  errorMessage: null,
};

/** Checkout payment method each return provider is displayed as. */
export const PAYMENT_RETURN_METHOD: Record<
  PaymentReturnProviderT,
  PaymentMethodT
> = {
  stripe: "stripe",
  paypal: "paypal",
  mollie: "ideal",
};

/** Maximum time the post-payment fulfillment pipeline may run before aborting. */
export const PAYMENT_PIPELINE_TIMEOUT_MS = 120_000;

/**
 * Order status for paid orders that could not be fulfilled. The refund
 * endpoint only accepts orders in this status (and with payment_status
 * still "paid"), so failure handling must never touch payment_status.
 */
export const FAILED_ORDER_STATUS = "unsuccessful_confirmation";

export const PAYMENT_RETURN_SERVICE_NAME: Record<
  PaymentReturnProviderT,
  string
> = {
  stripe: "StripeReturn",
  paypal: "PayPalReturn",
  mollie: "MollieReturn",
};

export const FALLBACK_ORDER_NUMBER_PREFIX: Record<
  PaymentReturnProviderT,
  string
> = {
  stripe: "ST",
  paypal: "PP",
  mollie: "ML",
};

export const PAYMENT_RETURN_ALTERNATIVE_METHODS: Record<
  PaymentReturnProviderT,
  PaymentAlternativeMethodT[]
> = {
  stripe: ["stripe", "paypal"],
  paypal: ["stripe", "paypal"],
  mollie: ["stripe", "paypal", "ideal"],
};

export const PAYMENT_RETURN_ROUTES = {
  checkout: "/checkout",
  cart: "/cart",
  orders: "/orders",
  dashboard: "/dashboard",
  createAnother: "/stamp",
} as const;
