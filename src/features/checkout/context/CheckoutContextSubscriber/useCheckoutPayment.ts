import { useCheckoutSubscriberSelector } from "./CheckoutContextSubscriber";
import { ShippingAddressT } from "@/schemas/checkout";

type PaymentStatus = "idle" | "success" | "error";

interface UseCheckoutPaymentReturn {
  shippingAddress: ShippingAddressT | null;
  paymentStatus: PaymentStatus;
  message: string;
  testMode: boolean;
  isProcessingPayment: boolean;
  triggerPayment: boolean;
  setTestMode: (value: boolean) => void;
  handlePaymentSuccess: (paymentIntent: any) => void;
  handlePaymentError: (error: string) => void;
  handleCompleteOrder: () => void;
  handlePaymentSubmitComplete: () => void;
}

/**
 * Select payment-related state and handlers
 * Use this in payment form components
 *
 * @example
 * const { paymentStatus, handlePaymentSuccess, handleCompleteOrder } = useCheckoutPayment();
 */
export function useCheckoutPayment(): UseCheckoutPaymentReturn {
  const shippingAddress = useCheckoutSubscriberSelector((state) => state.shippingAddress);
  const paymentStatus = useCheckoutSubscriberSelector((state) => state.paymentStatus);
  const message = useCheckoutSubscriberSelector((state) => state.message);
  const testMode = useCheckoutSubscriberSelector((state) => state.testMode);
  const isProcessingPayment = useCheckoutSubscriberSelector((state) => state.isProcessingPayment);
  const triggerPayment = useCheckoutSubscriberSelector((state) => state.triggerPayment);


  const setTestMode = useCheckoutSubscriberSelector((state) => state.setTestMode);
  const handlePaymentSuccess = useCheckoutSubscriberSelector((state) => state.handlePaymentSuccess);
  const handlePaymentError = useCheckoutSubscriberSelector((state) => state.handlePaymentError);
  const handleCompleteOrder = useCheckoutSubscriberSelector((state) => state.handleCompleteOrder);
  const handlePaymentSubmitComplete = useCheckoutSubscriberSelector((state) => state.handlePaymentSubmitComplete);

  return {
    shippingAddress,
    paymentStatus,
    message,
    testMode,
    isProcessingPayment,
    triggerPayment,
    setTestMode,
    handlePaymentSuccess,
    handlePaymentError,
    handleCompleteOrder,
    handlePaymentSubmitComplete,
  };
}
