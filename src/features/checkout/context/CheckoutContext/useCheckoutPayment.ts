import { useContextSelector } from "use-context-selector";
import { CheckoutContext } from "./CheckoutContext";
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
  const shippingAddress = useContextSelector(
    CheckoutContext,
    (v) => v?.shippingAddress,
  );
  const paymentStatus = useContextSelector(
    CheckoutContext,
    (v) => v?.paymentStatus,
  );
  const message = useContextSelector(CheckoutContext, (v) => v?.message);
  const testMode = useContextSelector(CheckoutContext, (v) => v?.testMode);
  const isProcessingPayment = useContextSelector(
    CheckoutContext,
    (v) => v?.isProcessingPayment,
  );
  const triggerPayment = useContextSelector(
    CheckoutContext,
    (v) => v?.triggerPayment,
  );
  const setTestMode = useContextSelector(CheckoutContext, (v) => v?.setTestMode);
  const handlePaymentSuccess = useContextSelector(
    CheckoutContext,
    (v) => v?.handlePaymentSuccess,
  );
  const handlePaymentError = useContextSelector(
    CheckoutContext,
    (v) => v?.handlePaymentError,
  );
  const handleCompleteOrder = useContextSelector(
    CheckoutContext,
    (v) => v?.handleCompleteOrder,
  );
  const handlePaymentSubmitComplete = useContextSelector(
    CheckoutContext,
    (v) => v?.handlePaymentSubmitComplete,
  );

  return {
    shippingAddress: shippingAddress!,
    paymentStatus: paymentStatus!,
    message: message!,
    testMode: testMode!,
    isProcessingPayment: isProcessingPayment!,
    triggerPayment: triggerPayment!,
    setTestMode: setTestMode!,
    handlePaymentSuccess: handlePaymentSuccess!,
    handlePaymentError: handlePaymentError!,
    handleCompleteOrder: handleCompleteOrder!,
    handlePaymentSubmitComplete: handlePaymentSubmitComplete!,
  };
}
