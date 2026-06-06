type PaymentStatus = "idle" | "success" | "error";

/**
 * Calculate the visual progress percentage
 */
export function calculateProgressWidth(
  hasShippingAddress: boolean,
  isProcessingPayment: boolean,
  paymentStatus: PaymentStatus
): string {
  if (paymentStatus === "success") return "100%";
  if (hasShippingAddress && !isProcessingPayment) return "50%";
  if (hasShippingAddress) return "25%";
  return "0%";
}

/**
 * Determine if a step is complete
 */
export function isStepComplete(
  stepNumber: number,
  hasShippingAddress: boolean,
  paymentStatus: PaymentStatus
): boolean {
  if (stepNumber === 1) return hasShippingAddress;
  if (stepNumber === 2) return paymentStatus === "success";
  if (stepNumber === 3) return paymentStatus === "success";
  return false;
}

/**
 * Determine if a step is currently active
 */
export function isStepActive(
  stepNumber: number,
  hasShippingAddress: boolean,
  paymentStatus: PaymentStatus
): boolean {
  if (stepNumber === 1) return !hasShippingAddress;
  if (stepNumber === 2) return hasShippingAddress && paymentStatus !== "success";
  if (stepNumber === 3) return paymentStatus === "success";
  return false;
}
