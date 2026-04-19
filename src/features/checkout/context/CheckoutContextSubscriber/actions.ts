import { useContext } from "react";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { ShippingAddressT } from "@/schemas/checkout";
import {
  useCreateOrderFromCart,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { useValidatePromoCode } from "@/queries/promocodeQueries";
import { OrderT } from "@/types/order";
import type { CreatePrintifyOrderRequest, PrintifyLineItem } from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import { mapShippingAddressToPrintifyAddress } from "@/mappers/mapShippingAddressToPrintifyAddress";
import { RefundService } from "@/services/refundService";
import { OrderService } from "@/services/orderService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import { useUser } from "@/hooks/useAuth";
import type {
  PaymentAlternativeMethodT,
  PaymentErrorDetailsI,
  PaymentMethodT,
  PaymentSuccessDetailsI,
} from "@/types/payment";

interface PaymentIntentI {
  id: string;
  [key: string]: unknown;
}

// ─── Timeout protection ──────────────────────────────────────────────────────

/** Maximum time (ms) the post-payment pipeline is allowed to run before aborting. */
const CHECKOUT_PIPELINE_TIMEOUT_MS = 120_000; // 2 minutes

class CheckoutTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
      `A full refund has been initiated and will appear within 3–5 business days.`
    );
    this.name = "CheckoutTimeoutError";
  }
}

/**
 * Race a promise against a timeout. Rejects with CheckoutTimeoutError if the
 * timeout fires first.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new CheckoutTimeoutError(ms)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

/**
 * Hook for checkout action handlers using store pattern
 * Components using this hook re-render when actions are called
 *
 * @example
 * const { handleShippingSubmit, handlePaymentSuccess } = useCheckoutSubscriberActions();
 */
export function useCheckoutSubscriberActions() {
  const store = useContext(CheckoutSubscriberContext);
  if (!store)
    throw new Error(
      "useCheckoutSubscriberActions must be used within CheckoutSubscriberProvider",
    );

  const { data: user } = useUser();
  const createOrderFromCart = useCreateOrderFromCart();
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const createPrintifyOrder = useCreatePrintifyOrder();
  const clearCart = useClearCart();
  const validatePromoCode = useValidatePromoCode();

  return {
/**
     * Handle shipping address form submission
     */
    handleUpdateShippingDetails: (data: OrderT) => {
      const state = store.getState();
      const {subtotal, shipping_cost, discount_amount} = data;
      let orderAmount = 0;

      if(subtotal && shipping_cost && discount_amount){
        orderAmount = subtotal + shipping_cost - discount_amount;

        store.setState({
          ...state,
          subtotal,
          shippingCost: data.shipping_cost ?? 0,
          discount: data.discount_amount ?? 0,
          orderAmount
        });

        return
      }
    },

    /**
     * Validate and apply promo code to checkout state
     */
    handleApplyPromoCode: async (code: string) => {
      const state = store.getState();

      const result = await validatePromoCode.mutateAsync({
        code,
        subtotal: state.subtotal,
      });

      if (!result.isValid || !result.appliedPromo) {
        const total = state.subtotal + state.shippingCost;
        store.setState({
          ...state,
          discount: 0,
          total,
          orderAmount: total,
          promoCode: null,
          promoValue: 0,
          promoType: null,
          promoError: result.message,
        });
        return result;
      }

      const discount = result.appliedPromo.discountValue;
      const total = state.subtotal + state.shippingCost - discount;
      store.setState({
        ...state,
        discount,
        total,
        orderAmount: total,
        promoCode: result.appliedPromo.code,
        promoValue: result.appliedPromo.value,
        promoType: result.appliedPromo.type,
        promoError: null,
      });

      return result;
    },

    /**
     * Clear currently applied promo code
     */
    handleClearPromoCode: () => {
      const state = store.getState();
      const total = state.subtotal + state.shippingCost;
      store.setState({
        ...state,
        discount: 0,
        total,
        orderAmount: total,
        promoCode: null,
        promoValue: 0,
        promoType: null,
        promoError: null,
      });
    },

    /**
     * Handle shipping address form submission
     */
    handleShippingSubmit: (data: ShippingAddressT) => {
      const state = store.getState();
      store.setState({
        ...state,
        shippingAddress: data,
      });
    },

    /**
     * Handle successful payment processing
     * Creates order, order items, and Printify order after payment succeeds, then clears the cart
     *
     * CRITICAL FIXES IMPLEMENTED:
     * 1. Idempotency check to prevent duplicate orders
     * 2. PayPal capture status validation
     */
    handlePaymentSuccess: async (paymentIntent: PaymentIntentI, lineItems: PrintifyLineItem[]) => {
      // ── In-flight guard ───────────────────────────────────────────────────
      // Synchronous check+set before any await: if this handler is already
      // running (e.g. a stale dual-layout mount fires a second call) the second
      // invocation returns immediately without touching the pipeline.
      if (store.getState().isProcessingPayment) {
        console.warn("⚠️ handlePaymentSuccess: duplicate invocation ignored");
        return;
      }

      const initialState = store.getState();

      store.setState({
        ...initialState,
        isProcessingPayment: true,
        message: "Payment confirmed. Finalizing your order...",
      });

      // Track the DB order ID across the pipeline so cleanup can reference it.
      let createdOrderId: string | null = null;

      // ─── Shared helpers (accessible from both try and catch) ──────────

      /** Trigger a refund for any post-payment failure */
      const triggerRefund = async (reason: string) => {
        try {
          const s = store.getState();
          const provider = s.selectedPaymentMethod;
          const tempOrderId = (paymentIntent as Record<string, unknown>)["metadata"]
            ? ((paymentIntent as Record<string, unknown>)["metadata"] as Record<string, unknown>)["order_id"] ?? `temp_${paymentIntent.id}`
            : `temp_${paymentIntent.id}`;

          await RefundService.processRefund({
            orderId: String(tempOrderId),
            paymentProvider: provider,
            amount: s.orderAmount,
            reason,
            stripePaymentIntentId:
              provider === "stripe" ? paymentIntent.id : undefined,
            paypalCaptureId:
              provider === "paypal"
                ? String((paymentIntent as Record<string, unknown>)["captureId"] ?? "")
                : undefined,
            molliePaymentId:
              provider === "mollie"
                ? String((paymentIntent as Record<string, unknown>)["molliePaymentId"] ?? "")
                : undefined,
          });
          console.log("✅ Refund initiated successfully");
        } catch (refundError) {
          console.error("❌ Refund initiation failed:", refundError);
        }
      };

      /** Mark an existing DB order as failed + refund pending */
      const markOrderFailed = async (orderId: string, failureStatus: string) => {
        try {
          await updateOrderStatus.mutateAsync({ orderId, status: failureStatus });
          await updatePaymentStatus.mutateAsync({ orderId, paymentStatus: "refund_pending" });
          console.log(`✅ Order ${orderId} marked as ${failureStatus} / refund_pending`);
        } catch (updateError) {
          console.error(`❌ Failed to mark order ${orderId} as ${failureStatus}:`, updateError);
        }
      };

      try {
        const state = store.getState();

        // ✅ CRITICAL FIX 1: Validate PayPal capture status before proceeding
        if (state.selectedPaymentMethod === "paypal") {
          const paypalIntent = paymentIntent as any;

          if (paypalIntent.status === "DENIED" || paypalIntent.status === "FAILED") {
            throw new Error(
              `PayPal payment ${paypalIntent.status.toLowerCase()}. Your payment was not captured.`
            );
          }

          if (!paypalIntent.captureId) {
            console.warn("⚠️ PayPal payment missing capture_id - payment may not be captured");
          }
        }

        if (!state.shippingAddress) {
          throw new Error("Shipping address missing. Unable to finalize order.");
        }

        if (!lineItems || lineItems.length === 0) {
          throw new Error("No order items found for Printify order creation.");
        }

        // ✅ CRITICAL FIX 2: Idempotency check to prevent duplicate orders
        const idempotencyKey = `${state.selectedPaymentMethod}_${paymentIntent.id}`;
        const existingOrder = await OrderService.getOrderByIdempotencyKey(idempotencyKey);

        if (existingOrder) {
          console.log(`✅ Order already exists for payment ${paymentIntent.id}, skipping duplicate creation`);

          const successDetails: PaymentSuccessDetailsI = {
            id: paymentIntent.id,
            provider: state.selectedPaymentMethod,
            status: "paid",
            orderNumber: existingOrder.order_number,
            totalPaid: `$${state.orderAmount.toFixed(2)}`,
            estimatedDelivery: "7–10 business days",
            confirmationEmail: state.shippingAddress?.email ?? "",
          };

          store.setState({
            ...state,
            isProcessingPayment: false,
            paymentStatus: "success",
            message: `Order ${existingOrder.order_number} already confirmed`,
            paymentSuccessDetails: successDetails,
            paymentErrorDetails: null,
          });

          return;
        }

        // ✅ CRITICAL FIX 3: Record payment for crash recovery
        if (state.cart && state.shippingAddress) {
          await PaymentRecoveryService.recordPaymentForRecovery({
            paymentProvider: state.selectedPaymentMethod,
            paymentIntentId: paymentIntent.id,
            paymentStatus: "succeeded",
            amount: state.orderAmount,
            currency: "EUR",
            cartSnapshot: state.cart,
            shippingAddress: state.shippingAddress,
            lineItems,
            metadata: {
              idempotency_key: idempotencyKey,
            },
          });
          console.log("✅ Payment recorded for crash recovery");
        }

        // ─── Stage 1: Create DB order ──────────────────────────────────────
        const retryOrderId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("retry_order_id")
            : null;
        const isRetryFlow = !!retryOrderId;
        createdOrderId = retryOrderId;

        if (!isRetryFlow && user && state.cart) {
          try {
            console.log("📝 Creating order from cart...");
            const newOrderId = await createOrderFromCart.mutateAsync({
              user,
              cart: state.cart,
              paymentStatus: "paid",
              orderStatus: "waiting_confirmation",
              shippingAddress: state.shippingAddress,
              idempotencyKey,
            });
            createdOrderId = newOrderId ?? null;
            console.log("✅ Order and order items created in database");

            // ✅ Link payment transaction to order
            if (createdOrderId) {
              await OrderService.linkPaymentTransactionToOrder({
                paymentProvider: state.selectedPaymentMethod,
                paymentIntentId: paymentIntent.id,
                orderId: createdOrderId,
              });
            }
          } catch (orderError) {
            console.error("❌ All order creation attempts failed. Initiating refund...");
            await triggerRefund("Order creation failed after retry attempts");

            const reason =
              orderError instanceof Error
                ? orderError.message
                : "Order creation failed after retry attempts.";
            throw new Error(
              `${reason} A full refund has been initiated and will appear within 3–5 business days.`
            );
          }
        }

        // ─── Stage 2: Printify fulfillment (timeout-protected) ─────────────

        const runFulfillmentPipeline = async () => {
          console.log("🚀 Creating Printify order after successful payment...");

          if (!state.shippingAddress) {
            throw new Error("Shipping address is required for order fulfillment");
          }

          // Validate that we have a valid order ID before proceeding
          if (!createdOrderId) {
            await triggerRefund("Order ID not available for Printify creation");
            throw new Error(
              "Cannot create Printify order: Order ID not available. A full refund has been initiated and will appear within 3–5 business days."
            );
          }

          console.log(`✅ Using order ID: ${createdOrderId}`);

          const validatedLineItems = lineItems.map((item, index) => {
            try {
              return validatePrintifyLineItem(item, index);
            } catch (error) {
              console.error(`❌ Line item ${index} validation failed:`, error);
              throw error;
            }
          });

          const orderPayload: CreatePrintifyOrderRequest = {
            line_items: validatedLineItems,
            shipping_address: mapShippingAddressToPrintifyAddress(state.shippingAddress),
            is_test: state.testMode,
            metadata: {
              payment_intent_id: paymentIntent.id,
              order_id: createdOrderId, // Now guaranteed to be a valid UUID
            },
          };

          try {
            const printifyResult = await createPrintifyOrder.mutateAsync(orderPayload);
            console.log("✅ Printify order created successfully");
            console.log("✅ Order status updated to 'confirmed' by create-printify-order function");

            // Persist the Printify order ID back to the DB order row
            const printifyOrderId = printifyResult?.order?.id;
            if (printifyOrderId && createdOrderId) {
              try {
                await OrderService.updateOrder(createdOrderId, {
                  printify_order_id: printifyOrderId,
                });
                console.log(`✅ Saved printify_order_id ${printifyOrderId} to order ${createdOrderId}`);
              } catch (updateErr) {
                // Non-critical — order is confirmed in Printify; log and continue
                console.error("❌ Failed to save printify_order_id:", updateErr);
              }
            }
          } catch (printifyError) {
            // ✅ Printify failure → mark order as failed + trigger refund
            console.error("❌ Printify order creation failed. Initiating refund...");

            if (createdOrderId) {
              await markOrderFailed(createdOrderId, "unsuccessful_confirmation");
            }
            await triggerRefund("Printify fulfillment failed after successful payment");

            const reason = printifyError instanceof Error
              ? printifyError.message
              : "Order fulfillment failed.";
            throw new Error(
              `${reason} A full refund has been initiated and will appear within 3–5 business days.`
            );
          }

          // ─── Stage 3: Mark payment recovered ────────────────────────────
          // Note: payment_status is already "paid" from order creation, no need to update
          if (createdOrderId) {
            await PaymentRecoveryService.markPaymentRecovered(
              paymentIntent.id,
              state.selectedPaymentMethod,
              createdOrderId
            );
            console.log("✅ Payment marked as recovered");
          }

          // Non-blocking cart cleanup
          if (!isRetryFlow) {
            try {
              await clearCart.mutateAsync();
              console.log("✅ Cart cleared successfully");
            } catch (error) {
              console.error("❌ Failed to clear cart:", error);
            }
          }
        };

        // ✅ Timeout protection: abort if pipeline exceeds CHECKOUT_PIPELINE_TIMEOUT_MS
        await withTimeout(runFulfillmentPipeline(), CHECKOUT_PIPELINE_TIMEOUT_MS);

        // ─── Success ─────────────────────────────────────────────────────
        const successState = store.getState();
        const successDetails: PaymentSuccessDetailsI = {
          id: paymentIntent.id,
          provider: successState.selectedPaymentMethod,
          status: "paid",
          orderNumber: `#SD-${paymentIntent.id.slice(-6).toUpperCase()}`,
          totalPaid: `$${successState.orderAmount.toFixed(2)}`,
          estimatedDelivery: "7–10 business days",
          confirmationEmail: successState.shippingAddress?.email ?? "",
        };

        store.setState({
          ...successState,
          isProcessingPayment: false,
          paymentStatus: "success",
          message: `Payment successful! Payment ID: ${paymentIntent.id}`,
          paymentSuccessDetails: successDetails,
          paymentErrorDetails: null,
        });
      } catch (error) {
        // ✅ Timeout → mark order as failed + trigger refund
        if (error instanceof CheckoutTimeoutError) {
          if (createdOrderId) {
            await markOrderFailed(createdOrderId, "unsuccessful_confirmation");
          }
          await triggerRefund("Checkout pipeline timed out");
        }

        const errorState = store.getState();
        const attemptedOn = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const reasonMessage =
          error instanceof Error
            ? error.message
            : "Payment was captured but order finalization failed.";

        const errorDetails: PaymentErrorDetailsI = {
          paymentId: `failed_${Date.now()}`,
          orderNumber: `#SD-${Date.now().toString().slice(-6)}`,
          amountDue: `$${errorState.orderAmount.toFixed(2)}`,
          attemptedOn,
          status: "Failed",
          reasonTitle: "Reason",
          reasonMessage,
          availableMethods: ["paypal", "applepay", "stripe", "mollie"] satisfies PaymentAlternativeMethodT[],
          isPostPaymentError: true,
        };

        store.setState({
          ...errorState,
          isProcessingPayment: false,
          paymentStatus: "error",
          message: reasonMessage,
          paymentSuccessDetails: null,
          paymentErrorDetails: errorDetails,
        });
      }
    },

    /**
     * Handle payment processing error
     */
    handlePaymentError: (errorMsg: string) => {
      const state = store.getState();
      const attemptedOn = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const fallbackMessage =
        "The issuing bank declined the transaction. This could be due to insufficient funds, an expired card, or a temporary security block.";
      const errorDetails: PaymentErrorDetailsI = {
        paymentId: `failed_${Date.now()}`,
        orderNumber: `#SD-${Date.now().toString().slice(-6)}`,
        amountDue: `$${state.orderAmount.toFixed(2)}`,
        attemptedOn,
        status: "Failed",
        reasonTitle: "Reason",
        reasonMessage: errorMsg?.trim() || fallbackMessage,
        availableMethods: ["paypal", "applepay", "stripe", "mollie"] satisfies PaymentAlternativeMethodT[],
      };

      store.setState({
        ...state,
        isProcessingPayment: false,
        paymentStatus: "error",
        message: errorMsg,
        paymentSuccessDetails: null,
        paymentErrorDetails: errorDetails,
      });
    },

    /**
     * Reset checkout state to create another order
     */
    handleCreateAnother: () => {
      const state = store.getState();
      store.setState({
        ...state,
        paymentStatus: "idle",
        shippingAddress: null,
        message: "",
        isProcessingPayment: false,
        paymentSuccessDetails: null,
        paymentErrorDetails: null,
      });
    },

    /**
     * Reset payment state to retry failed payment
     */
    handleTryAgain: () => {
      const state = store.getState();
      store.setState({
        ...state,
        paymentStatus: "idle",
        message: "",
        isProcessingPayment: false,
        paymentSuccessDetails: null,
        paymentErrorDetails: null,
      });
    },

    /**
     * Toggle test mode for payment processing
     */
    setTestMode: (value: boolean) => {
      const state = store.getState();
      store.setState({
        ...state,
        testMode: value,
      });
    },

    /**
     * Set the selected payment method (stripe or paypal)
     */
    setPaymentMethod: (method: PaymentMethodT) => {
      const state = store.getState();
      store.setState({
        ...state,
        selectedPaymentMethod: method,
      });
    },
  };
}
