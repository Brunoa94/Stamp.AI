import { useContext } from "react";
import { CheckoutSubscriberContext } from "./CheckoutContextSubscriber";
import { ShippingAddressT } from "@/schemas/checkout";

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

  return {
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
     */
    handlePaymentSuccess: (paymentIntent: any) => {
      const state = store.getState();
      store.setState({
        ...state,
        isProcessingPayment: false,
        paymentStatus: "success",
        message: `Payment successful! Payment ID: ${paymentIntent.id}`,
      });
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
  };
}
