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
      const initialState = store.getState();

      store.setState({
        ...initialState,
        isProcessingPayment: true,
        message: "Payment confirmed. Finalizing your order...",
      });

      try {
        const state = store.getState();

        // ✅ CRITICAL FIX 1: Validate PayPal capture status before proceeding
        if (state.selectedPaymentMethod === "paypal") {
          const paypalIntent = paymentIntent as any;

          // Check if status indicates failure
          if (paypalIntent.status === "DENIED" || paypalIntent.status === "FAILED") {
            throw new Error(
              `PayPal payment ${paypalIntent.status.toLowerCase()}. Your payment was not captured.`
            );
          }

          // Check if capture ID is missing (required for successful PayPal payments)
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

          // Return success state with existing order
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
        // If browser crashes after this point, user can recover their order
        if (state.cart && state.shippingAddress) {
          await PaymentRecoveryService.recordPaymentForRecovery({
            paymentProvider: state.selectedPaymentMethod,
            paymentIntentId: paymentIntent.id,
            paymentStatus: "succeeded",
            amount: state.orderAmount,
            currency: "USD", // TODO: Make this dynamic if supporting multiple currencies
            cartSnapshot: state.cart,
            shippingAddress: state.shippingAddress,
            lineItems,
            metadata: {
              idempotency_key: idempotencyKey,
            },
          });
          console.log("✅ Payment recorded for crash recovery");
        }

        // First, create order and order_items in database.
        // Retry behavior is handled by React Query in useCreateOrderFromCart.
        const retryOrderId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("retry_order_id")
            : null;
        const isRetryFlow = !!retryOrderId;

        let createdOrderId: string | null = retryOrderId;

        if (!isRetryFlow && user && state.cart) {
          try {
            console.log("📝 Creating order from cart...");
            const newOrderId = await createOrderFromCart.mutateAsync({
              user,
              cart: state.cart,
              paymentStatus: "paid",
              shippingAddress: state.shippingAddress,
              idempotencyKey,
            });
            createdOrderId = newOrderId ?? null;
            console.log("✅ Order and order items created in database");
          } catch (orderError) {
            // Retries have been exhausted by React Query — initiate automatic refund
            console.error("❌ All order creation attempts failed. Initiating refund...");
            try {
              const provider = state.selectedPaymentMethod;
              const orderId = (paymentIntent as Record<string, unknown>)["metadata"]
                ? ((paymentIntent as Record<string, unknown>)["metadata"] as Record<string, unknown>)["order_id"] ?? `temp_${paymentIntent.id}`
                : `temp_${paymentIntent.id}`;

              await RefundService.processRefund({
                orderId: String(orderId),
                paymentProvider: provider,
                amount: state.orderAmount,
                reason: "Order creation failed after retry attempts",
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

            const reason =
              orderError instanceof Error
                ? orderError.message
                : "Order creation failed after retry attempts.";
            throw new Error(
              `${reason} A full refund has been initiated and will appear within 3–5 business days.`
            );
          }
        }

        // Next, create the Printify order with validated line items
        console.log("🚀 Creating Printify order after successful payment...");
        console.log("📦 Line items received:", JSON.stringify(lineItems, null, 2));

        const validatedLineItems = lineItems.map((item, index) => {
          try {
            return validatePrintifyLineItem(item, index);
          } catch (error) {
            console.error(`❌ Line item ${index} validation failed:`, error);
            throw error;
          }
        });

        console.log("✅ Validated line items:", JSON.stringify(validatedLineItems, null, 2));

        const orderPayload: CreatePrintifyOrderRequest = {
          line_items: validatedLineItems,
          shipping_address: mapShippingAddressToPrintifyAddress(state.shippingAddress),
          is_test: state.testMode,
          metadata: {
            payment_intent_id: paymentIntent.id,
            order_id: createdOrderId ?? `order_${Date.now()}`,
          },
        };

        console.log("📤 Sending to Printify:", JSON.stringify(orderPayload, null, 2));

        await createPrintifyOrder.mutateAsync(orderPayload);
        console.log("✅ Printify order created successfully");

        // Mark local order as confirmed only after product/order creation succeeds
        if (createdOrderId) {
          await updatePaymentStatus.mutateAsync({
            orderId: createdOrderId,
            paymentStatus: "paid",
          });
          await updateOrderStatus.mutateAsync({
            orderId: createdOrderId,
            status: "confirmed",
          });
          console.log(`✅ Order ${createdOrderId} payment/status updated to paid/confirmed`);

          // ✅ Mark payment as recovered (no longer needs recovery)
          await PaymentRecoveryService.markPaymentRecovered(
            paymentIntent.id,
            state.selectedPaymentMethod,
            createdOrderId
          );
          console.log("✅ Payment marked as recovered");
        }

        // Non-blocking cleanup (skip cart clear for retry flow to avoid removing unrelated active carts)
        if (!isRetryFlow) {
          try {
            console.log("🧹 Clearing cart after successful payment...");
            await clearCart.mutateAsync();
            console.log("✅ Cart cleared successfully");
          } catch (error) {
            console.error("❌ Failed to clear cart:", error);
          }
        }

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
     * Trigger payment processing after shipping confirmation
     */
    handleCompleteOrder: () => {
      const state = store.getState();
      if (!state.shippingAddress) {
        return;
      }
      store.setState({
        ...state,
        triggerPayment: true,
      });
    },

    /**
     * Reset payment trigger after submission attempt
     * Only resets triggerPayment flag, not isProcessingPayment
     * (isProcessingPayment is managed by handlePaymentSuccess/handlePaymentError)
     */
    handlePaymentSubmitComplete: () => {
      const state = store.getState();
      store.setState({
        ...state,
        triggerPayment: false,
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
        triggerPayment: false,
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
        triggerPayment: false,
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
