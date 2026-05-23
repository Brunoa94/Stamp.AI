/**
 * Server-Side Amount Validation
 *
 * CRITICAL: Prevents price tampering by validating payment amounts
 * match expected totals calculated server-side.
 */

export interface CartItemI {
  price: number;
  quantity: number;
}

export interface AmountValidationPayloadI {
  paymentAmount: number;
  paymentCurrency: string;
  cartItems?: CartItemI[];
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  expectedTotal?: number;
}

export interface AmountValidationResultI {
  isValid: boolean;
  calculatedTotal: number;
  providedAmount: number;
  difference: number;
  errorMessage?: string;
}

/**
 * Validate payment amount matches expected total
 *
 * @param payload - Validation payload with payment and cart data
 * @returns Validation result with detailed breakdown
 */
export function validatePaymentAmount(
  payload: AmountValidationPayloadI
): AmountValidationResultI {
  const {
    paymentAmount,
    paymentCurrency,
    cartItems,
    subtotal,
    shippingCost = 0,
    discount = 0,
    expectedTotal,
  } = payload;

  let calculatedTotal: number;

  // Calculate total from cart items if provided
  if (cartItems && cartItems.length > 0) {
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    calculatedTotal = itemsSubtotal + shippingCost - discount;
  }
  // Use provided subtotal if cart items not available
  else if (subtotal !== undefined) {
    calculatedTotal = subtotal + shippingCost - discount;
  }
  // Use expected total if provided
  else if (expectedTotal !== undefined) {
    calculatedTotal = expectedTotal;
  }
  // Cannot validate without any pricing data
  else {
    console.warn('⚠️ Amount validation skipped - no pricing data provided');
    return {
      isValid: true, // Allow through but log warning
      calculatedTotal: paymentAmount,
      providedAmount: paymentAmount,
      difference: 0,
      errorMessage: 'Amount validation skipped - insufficient data',
    };
  }

  // Round to 2 decimal places to avoid floating point issues
  calculatedTotal = Math.round(calculatedTotal * 100) / 100;
  const roundedPaymentAmount = Math.round(paymentAmount * 100) / 100;
  // Round difference to 2 decimal places as well to avoid floating point comparison issues
  const difference = Math.round(Math.abs(roundedPaymentAmount - calculatedTotal) * 100) / 100;

  // Allow 1 cent tolerance for rounding differences
  const TOLERANCE = 0.01;
  const isValid = difference <= TOLERANCE;

  if (!isValid) {
    console.error('❌ AMOUNT MISMATCH DETECTED:');
    console.error(`  Expected: ${paymentCurrency} ${calculatedTotal.toFixed(2)}`);
    console.error(`  Received: ${paymentCurrency} ${roundedPaymentAmount.toFixed(2)}`);
    console.error(`  Difference: ${paymentCurrency} ${difference.toFixed(2)}`);
    console.error('  This may indicate price tampering or calculation error!');

    return {
      isValid: false,
      calculatedTotal,
      providedAmount: roundedPaymentAmount,
      difference,
      errorMessage: `Payment amount mismatch: expected ${paymentCurrency} ${calculatedTotal.toFixed(2)}, received ${paymentCurrency} ${roundedPaymentAmount.toFixed(2)}`,
    };
  }

  console.log(`✅ Amount validation passed: ${paymentCurrency} ${calculatedTotal.toFixed(2)}`);

  return {
    isValid: true,
    calculatedTotal,
    providedAmount: roundedPaymentAmount,
    difference,
  };
}

/**
 * Validate currency matches expected currency
 *
 * @param paymentCurrency - Currency from payment
 * @param expectedCurrency - Expected currency (default: USD)
 * @returns true if currencies match
 */
export function validateCurrency(
  paymentCurrency: string,
  expectedCurrency: string = 'USD'
): boolean {
  const normalizedPayment = paymentCurrency.toUpperCase();
  const normalizedExpected = expectedCurrency.toUpperCase();

  if (normalizedPayment !== normalizedExpected) {
    console.error(`❌ CURRENCY MISMATCH: Expected ${normalizedExpected}, got ${normalizedPayment}`);
    return false;
  }

  return true;
}
