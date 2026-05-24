"use client";

import { cartTheme, buttonTheme } from "@/theme/components";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/features/ui/button";

interface Props {
  itemCount: number;
  subtotal: number;
  onCheckout?: () => void;
}

export function CartSummary({
  itemCount: _itemCount,
  subtotal,
  onCheckout,
}: Props) {
  const shipping = subtotal > 50 ? 0 : 0.99;
  const total = subtotal + (shipping === 0 ? 0 : shipping);

  return (
    <div className={cartTheme.summary.container}>
      {/* Desktop title */}
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
            <span className={cartTheme.summary.freeValue}>FREE</span>
          ) : (
            <span className={cartTheme.summary.rowValue}>
              ${shipping.toFixed(2)}
            </span>
          )}
        </div>

        <div className={cartTheme.summary.row}>
          <span className={cartTheme.summary.rowLabel}>Tax</span>
          <span className={cartTheme.summary.taxValue}>
            Calculated at checkout
          </span>
        </div>
      </div>

      <div className={cartTheme.summary.divider} />

      <div className={cartTheme.summary.totalRow}>
        <span className={cartTheme.summary.totalLabel}>Total</span>
        <span className={cartTheme.summary.totalValue}>
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Desktop checkout button */}
      {onCheckout && (
        <Button
          variant="default"
          size="lg"
          className={`hidden lg:flex w-full py-5 mt-6 ${buttonTheme.actionPrimary}`}
          onClick={onCheckout}
        >
          <span>PROCEED TO CHECKOUT</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      )}

      {/* Desktop estimated arrival */}
      <div className={cartTheme.summary.arrivalWrap}>
        <div className={cartTheme.summary.arrivalHeader}>
          <Package className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className={cartTheme.summary.arrivalLabel}>
            Estimated Arrival
          </span>
        </div>
        <p className={cartTheme.summary.arrivalValue}>3-5 business days</p>
      </div>
    </div>
  );
}
