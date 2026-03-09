import { useContext } from "react";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { ShippingAddressT } from "@/schemas/checkout";
import { useCreateOrderFromCart } from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { OrderT } from "@/types/order";
import type { CreatePrintifyOrderRequest, PrintifyLineItem } from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";

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

  const createPrintifyOrder = useCreatePrintifyOrder();
  const clearCart = useClearCart();

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
     * Creates the Printify order after payment succeeds and clears the cart
     */
    handlePaymentSuccess: async (paymentIntent: PaymentIntentI, lineItems: PrintifyLineItem[]) => {
      const state = store.getState();

      // First, update payment status to success
      store.setState({
        ...state,
        isProcessingPayment: false,
        paymentStatus: "success",
        message: `Payment successful! Payment ID: ${paymentIntent.id}`,
      });

      // Then, create the Printify order with the line items
      if (lineItems && lineItems.length > 0 && state.shippingAddress) {
        try {
          console.log("🚀 Creating Printify order after successful payment...");
          console.log("📦 Line items received:", JSON.stringify(lineItems, null, 2));

          // CRITICAL VALIDATION: Ensure Printify API requirements are met
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
            shipping_address: {
              first_name: state.shippingAddress.first_name,
              last_name: state.shippingAddress.last_name || "",
              email: state.shippingAddress.email,
              phone: state.shippingAddress.phone || "",
              country: state.shippingAddress.country,
              region: state.shippingAddress.region || "",
              address1: state.shippingAddress.address1,
              address2: state.shippingAddress.address2 || "",
              city: state.shippingAddress.city,
              zip: state.shippingAddress.zip || "",
            },
            is_test: state.testMode,
            metadata: {
              payment_intent_id: paymentIntent.id,
              order_id: `order_${Date.now()}`,
            },
          };

          console.log("📤 Sending to Printify:", JSON.stringify(orderPayload, null, 2));

          await createPrintifyOrder.mutateAsync(orderPayload);
          console.log("✅ Printify order created successfully");
        } catch (error) {
          console.error("❌ Failed to create Printify order:", error);
          // Don't fail the entire checkout - payment already succeeded
          // Just log the error for now
        }
      }

      // Finally, clear the cart after successful payment
      try {
        console.log("🧹 Clearing cart after successful payment...");
        await clearCart.mutateAsync();
        console.log("✅ Cart cleared successfully");
      } catch (error) {
        console.error("❌ Failed to clear cart:", error);
        // Don't fail checkout if cart clearing fails - payment already succeeded
      }
    },

    /**
     * Handle payment processing error
     */
    handlePaymentError: (errorMsg: string) => {
      const state = store.getState();
      store.setState({
        ...state,
        isProcessingPayment: false,
        paymentStatus: "error",
        message: errorMsg,
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
        isProcessingPayment: true,
        triggerPayment: true,
      });
    },

    /**
     * Reset payment trigger after submission attempt
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

    proceedToCheckout: useCreateOrderFromCart()
  };
}
