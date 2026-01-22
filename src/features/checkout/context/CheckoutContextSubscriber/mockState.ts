import { CheckoutSubscriberContextState } from "./types";

export const MOCK_STATE: CheckoutSubscriberContextState = {
  // Data state
  order: null,
  orderItems: [],
  customProduct: null,
  isLoading: false,
  error: null,

  // Customization
  customization: {
    variant_id: 0,
    quantity: 1,
    print_areas: {
      front: undefined,
      back: undefined,
      left_sleeve: undefined,
      right_sleeve: undefined,
      neck: undefined,
    },
    product_title: "",
    variant_title: "",
    price: 0,
  },

  // Checkout handlers state
  shippingAddress: null,
  paymentStatus: "idle",
  message: "",
  testMode: false,
  isProcessingPayment: false,
  triggerPayment: false,

  // State setters
  setTestMode: () => {},

  // Event handlers
  handleShippingSubmit: () => {},
  handlePaymentSuccess: () => {},
  handlePaymentError: () => {},
  handleCompleteOrder: () => {},
  handlePaymentSubmitComplete: () => {},
  handleCreateAnother: () => {},
  handleTryAgain: () => {},

  // Computed values
  subtotal: 0,
  shippingCost: 0,
  discount: 0,
  orderAmount: 0,
  lineItems: [],
};
