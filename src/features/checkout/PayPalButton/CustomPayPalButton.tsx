"use client";

import { useState } from "react";
import { FaPaypal } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import clsx from "clsx";

interface CustomPayPalButtonProps {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  disabled?: boolean;
  onError?: (error: string) => void;
  className?: string;
  variant?: "desktop" | "mobile";
}

const PAYPAL_CHECKOUT_DATA_KEY = "paypal_checkout_data";

export interface PayPalCheckoutData {
  orderId: string;
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  cartId: string | null;
  timestamp: number;
}

export function CustomPayPalButton({
  amount,
  lineItems,
  shippingAddress,
  disabled = false,
  onError,
  className,
  variant = "desktop",
}: CustomPayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI.paypal;

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // Build return and cancel URLs
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/checkout/paypal-return`;
      const cancelUrl = `${baseUrl}/checkout?cancelled=true`;

      // Call our API to create a PayPal order
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          lineItems,
          shippingAddress,
          returnUrl,
          cancelUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PayPal order");
      }

      if (!data.orderId || !data.approvalUrl) {
        throw new Error("Invalid response from server");
      }

      // Get cart ID from URL
      const cartIdFromUrl = new URLSearchParams(window.location.search).get("cartId");

      // Store checkout data in localStorage for the return page
      const checkoutData: PayPalCheckoutData = {
        orderId: data.orderId,
        amount,
        lineItems,
        shippingAddress,
        cartId: cartIdFromUrl,
        timestamp: Date.now(),
      };
      localStorage.setItem(PAYPAL_CHECKOUT_DATA_KEY, JSON.stringify(checkoutData));

      // Redirect to PayPal
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error("PayPal checkout error:", error);
      setIsLoading(false);

      if (onError) {
        onError(error instanceof Error ? error.message : "Failed to initiate PayPal checkout");
      }
    }
  };

  const buttonLabel = isLoading
    ? "Redirecting to PayPal..."
    : variant === "mobile"
      ? selectedUi.labelMobile
      : selectedUi.labelDesktop;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={clsx(
        "w-full rounded-none text-white font-heading font-extrabold uppercase tracking-widest py-4 shadow-lg",
        selectedUi.className,
        {
          "opacity-50 cursor-not-allowed": disabled || isLoading,
        },
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FaPaypal className="w-4 h-4" />
      )}
      {buttonLabel}
    </Button>
  );
}

/**
 * Retrieve stored PayPal checkout data
 */
export function getStoredPayPalCheckoutData(): PayPalCheckoutData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(PAYPAL_CHECKOUT_DATA_KEY);
    if (!stored) return null;

    const data: PayPalCheckoutData = JSON.parse(stored);

    // Check if data is not expired (30 minutes max)
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - data.timestamp > maxAge) {
      localStorage.removeItem(PAYPAL_CHECKOUT_DATA_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Clear stored PayPal checkout data
 */
export function clearStoredPayPalCheckoutData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PAYPAL_CHECKOUT_DATA_KEY);
}
