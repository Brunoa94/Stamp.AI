"use client";

import { CreditCard, Truck } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cartTheme } from "@/theme/components";

interface Props {
  itemCount: number;
  subtotal: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export function CartSummary({
  itemCount,
  subtotal,
  onCheckout,
  isProcessing = false,
}: Props) {
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className={cartTheme.summary.card}>
      <h2 className={cartTheme.summary.title}>Order Summary</h2>

      <div className={cartTheme.summary.rows}>
        <div className={cartTheme.summary.row}>
          <span className={cartTheme.summary.rowLabel}>Subtotal</span>
          <span className={cartTheme.summary.rowValue}>
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className={cartTheme.summary.row}>
          <span className={cartTheme.summary.rowLabel}>Shipping</span>
          {shipping === 0 ? (
            <span className={cartTheme.summary.freeValue}>Free</span>
          ) : (
            <span className={cartTheme.summary.rowValue}>
              ${shipping.toFixed(2)}
            </span>
          )}
        </div>

        <div className={cartTheme.summary.row}>
          <span className={cartTheme.summary.rowLabel}>Estimated Tax</span>
          <span className={cartTheme.summary.rowValue}>${tax.toFixed(2)}</span>
        </div>

        <div className={cartTheme.summary.totalRow}>
          <span className={cartTheme.summary.totalLabel}>Total</span>
          <span className={cartTheme.summary.totalValue}>
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <Button
          onClick={onCheckout}
          disabled={isProcessing || itemCount === 0}
          size="default"
          className={cartTheme.summary.checkoutButton}
        >
          {isProcessing ? "Processing..." : "Checkout Now"}
          <CreditCard className="text-xl" />
        </Button>

        <p className={cartTheme.summary.secureText}>
          Secure processing with end-to-end encryption
        </p>

        <div className={cartTheme.summary.arrivalWrap}>
          <div className={cartTheme.summary.arrivalHeader}>
            <Truck className="text-lg text-[#06B6D4]" />
            <span className={cartTheme.summary.arrivalLabel}>
              Estimated Arrival
            </span>
          </div>
          <p className={cartTheme.summary.arrivalValue}>
            March 12 - March 15, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
