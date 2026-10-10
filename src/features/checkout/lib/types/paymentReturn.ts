import type { MolliePaymentStatus } from "@/lib/mollie";
import type { CartWithItems } from "@/shared/types/cart";
import type {
  CreatePrintifyOrderRequest,
  PrintifyLineItem,
  PrintifyOrderResponse,
} from "@/shared/types/printifyOrder";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
import type { UserI } from "@/supabase/types";

/** Payment providers that redirect back to a checkout return page. */
export type PaymentReturnProviderT = "stripe" | "paypal" | "mollie";

export type PaymentReturnStatusT =
  | "loading"
  | "processing"
  | "success"
  | "failed"
  | "cancelled"
  | "pending"
  | "error";

export interface PaymentReturnStateI {
  status: PaymentReturnStatusT;
  paymentId: string | null;
  orderNumber: string | null;
  errorMessage: string | null;
}

export interface PayPalReturnStateI extends PaymentReturnStateI {
  captureId: string | null;
}

export interface MollieReturnStateI extends PaymentReturnStateI {
  providerStatus: MolliePaymentStatus | null;
  cartId: string | null;
}

export type PaymentReturnUpdateT<TState extends PaymentReturnStateI> = (
  patch: Partial<TState>,
) => void;

/** Translator scoped to one `checkout.returns.<provider>` namespace. */
export type PaymentReturnTranslatorT = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface CreateOrderFromCartInputI {
  user: UserI;
  cart: CartWithItems;
  paymentStatus?: string;
  shippingAddress?: ShippingAddressT;
  billingAddress?: ShippingAddressT;
  idempotencyKey?: string;
  paymentMethod?: string;
  paymentAmountCents?: number;
  shippingCostCents?: number;
  discountCents?: number;
}

/** React Query mutations the fulfillment pipeline runs through. */
export interface OrderFulfillmentDepsI {
  createOrderFromCart: (
    input: CreateOrderFromCartInputI,
  ) => Promise<string | null | undefined>;
  createPrintifyOrder: (
    payload: CreatePrintifyOrderRequest,
  ) => Promise<PrintifyOrderResponse>;
  updateOrderStatus: (input: {
    orderId: string;
    status: string;
  }) => Promise<unknown>;
  removeCartItems: (itemIds: string[]) => Promise<unknown>;
}

/** User-facing messages thrown when a pipeline stage fails. */
export interface OrderFulfillmentMessagesI {
  orderCreationFailed: (cause: unknown) => string;
  orderIdMissing: string;
  fulfillmentFailed: (cause: unknown) => string;
}

export interface OrderFulfillmentRequestI {
  provider: PaymentReturnProviderT;
  /** Provider payment identifier (Stripe intent, PayPal order token, Mollie payment). */
  paymentId: string;
  /** Identifier the refund endpoint expects (PayPal capture ID, otherwise `paymentId`). */
  refundReference: string | null;
  user: UserI;
  cartSnapshot: CartWithItems;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  billingAddress?: ShippingAddressT;
  amount: number;
  currency: string;
  shippingCostCents?: number;
  discountCents?: number;
  /** Extra provider data stored with the recovery record and Printify order. */
  metadata?: Record<string, string | undefined>;
  /** Extra provider data stored only with the recovery record. */
  recoveryMetadata?: Record<string, string | undefined>;
  generateInvoice?: boolean;
  messages: OrderFulfillmentMessagesI;
}

export interface OrderFulfillmentResultI {
  orderNumber: string | null;
}

export type FulfillOrderT = (
  request: OrderFulfillmentRequestI,
) => Promise<OrderFulfillmentResultI>;

/** Everything a provider return processor needs from the React layer. */
export interface PaymentReturnContextI<TState extends PaymentReturnStateI> {
  user: UserI | null;
  t: PaymentReturnTranslatorT;
  fulfillOrder: FulfillOrderT;
  update: PaymentReturnUpdateT<TState>;
}
