import { useState } from "react";
import { ShippingAddressT } from "@/schemas/checkout";

type PaymentStatus = "idle" | "success" | "error";

/**
 * Custom hook for managing checkout event handlers
 * Encapsulates all checkout flow logic in one place
 */
export function useCheckoutHandlers() {
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressT | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [message, setMessage] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [triggerPayment, setTriggerPayment] = useState(false);

  const handleShippingSubmit = (data: ShippingAddressT) => {
    setShippingAddress(data);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setIsProcessingPayment(false);
    setPaymentStatus("success");
    setMessage(`Payment successful! Payment ID: ${paymentIntent.id}`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setIsProcessingPayment(false);
    setPaymentStatus("error");
    setMessage(errorMsg);
  };

  const handleCompleteOrder = () => {
    if (!shippingAddress) {
      return;
    }
    setIsProcessingPayment(true);
    setTriggerPayment(true);
  };

  const handlePaymentSubmitComplete = () => {
    setTriggerPayment(false);
  };

  const handleCreateAnother = () => {
    setPaymentStatus("idle");
    setShippingAddress(null);
    setMessage("");
    setIsProcessingPayment(false);
    setTriggerPayment(false);
  };

  const handleTryAgain = () => {
    setPaymentStatus("idle");
    setMessage("");
    setIsProcessingPayment(false);
    setTriggerPayment(false);
  };

  return {
    // State
    shippingAddress,
    paymentStatus,
    message,
    testMode,
    isProcessingPayment,
    triggerPayment,

    // State setters
    setTestMode,

    // Event handlers
    handleShippingSubmit,
    handlePaymentSuccess,
    handlePaymentError,
    handleCompleteOrder,
    handlePaymentSubmitComplete,
    handleCreateAnother,
    handleTryAgain,
  };
}
