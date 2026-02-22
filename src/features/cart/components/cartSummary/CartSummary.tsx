"use client";

import { Lock, Tag, Truck, Shield } from "lucide-react";
import { Button } from "@/features/ui/button";
import clsx from "clsx";
import { useState } from "react";

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
  const [promoCode, setPromoCode] = useState("");

  // Calculate estimates
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax estimate
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
        <p className="text-sm text-gray-600 mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {/* Order Details */}
      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Shipping</span>
          </div>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Free shipping threshold */}
        {shipping > 0 && (
          <div className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-md">
            Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-gray-700">
          <span>Estimated Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        {/* Promo Code */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="px-4"
              disabled={!promoCode.trim()}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-slate-700">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-6 pt-0">
        <Button
          onClick={onCheckout}
          disabled={isProcessing || itemCount === 0}
          size="lg"
          className={clsx(
            "w-full",
            !(itemCount === 0 || isProcessing) &&
              "bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 text-white hover:opacity-90 shadow-lg shadow-slate-500/30",
          )}
        >
          <Lock className="w-5 h-5" />
          {isProcessing ? "Processing..." : "Secure Checkout"}
        </Button>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
