"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { componentThemes } from "@/theme";
import clsx from "clsx";

interface Props {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export function CartSummary({ subtotal, itemCount, onCheckout, isProcessing = false }: Props) {
  const shipping = subtotal > 0 ? 10 : 0; // Simple shipping calculation
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h2 className={componentThemes.text.subheading}>Order Summary</h2>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Estimated Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-gray-900 text-lg">Total</span>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={isProcessing || itemCount === 0}
        className={clsx(
          "w-full mt-6 px-6 py-3 rounded-lg font-semibold transition-all",
          "flex items-center justify-center gap-2",
          itemCount === 0 || isProcessing
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white hover:opacity-90"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        {isProcessing ? "Processing..." : "Proceed to Checkout"}
      </button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Free shipping on orders over $50</p>
      </div>
    </div>
  );
}
