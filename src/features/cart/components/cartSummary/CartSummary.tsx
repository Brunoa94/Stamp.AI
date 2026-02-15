"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/features/ui/button";
import clsx from "clsx";

interface Props {
  itemCount: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export function CartSummary({ itemCount, onCheckout, isProcessing = false }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <Button
        onClick={onCheckout}
        disabled={isProcessing || itemCount === 0}
        size="lg"
        className={clsx(
          "w-full",
          !(itemCount === 0 || isProcessing) &&
            "bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white hover:opacity-90"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        {isProcessing ? "Processing..." : "Proceed to Checkout"}
      </Button>
    </div>
  );
}
