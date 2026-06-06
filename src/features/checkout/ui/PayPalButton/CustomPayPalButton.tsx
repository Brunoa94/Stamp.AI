"use client";

import { useFormContext } from "react-hook-form";
import { FaPaypal } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import { usePreparePayPalPayment } from "../../lib/queries/paymentQueries";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";
import clsx from "clsx";

interface CustomPayPalButtonProps {
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
  disabled?: boolean;
  className?: string;
  variant?: "desktop" | "mobile";
}

/**
 * CustomPayPalButton
 * PayPal payment button following FSD patterns
 *
 * Integrates with:
 * - PaymentService for business logic
 * - usePreparePayPalPayment query for mutation
 * - CheckoutFormContext for form data
 * - useErrorHandler for error handling
 */
export function CustomPayPalButton({
  cart,
  cartId,
  amount,
  disabled = false,
  className,
  variant = "desktop",
}: CustomPayPalButtonProps) {
  const { getValues } = useFormContext<CheckoutFormData>();
  const { mutateAsync: preparePayPal, isPending } = usePreparePayPalPayment();
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI.paypal;

  const handleClick = async () => {
    if (disabled || isPending) return;

    try {
      // Get form data from context
      const formData = getValues();

      // Prepare PayPal payment (creates order, stores data)
      const { approvalUrl } = await preparePayPal({
        formData,
        cart,
        cartId,
        amount,
      });

      // Redirect to PayPal approval page
      window.location.href = approvalUrl;
    } catch (error) {
      // Error is handled by useErrorHandler in the mutation
      console.error("PayPal checkout error:", error);
    }
  };

  const buttonLabel = isPending
    ? "Redirecting to PayPal..."
    : variant === "mobile"
      ? selectedUi.labelMobile
      : selectedUi.labelDesktop;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={clsx(
        "w-full rounded-none text-white font-heading font-extrabold uppercase tracking-widest py-4 shadow-lg",
        selectedUi.className,
        {
          "opacity-50 cursor-not-allowed": disabled || isPending,
        },
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FaPaypal className="w-4 h-4" />
      )}
      {buttonLabel}
    </Button>
  );
}
