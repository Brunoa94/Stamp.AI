"use client";

import { ShoppingCart } from "lucide-react";
import { componentThemes } from "@/theme";

export function CartHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <ShoppingCart className="w-8 h-8 text-purple-600" />
        <h1 className={componentThemes.text.heading}>Shopping Cart</h1>
      </div>
      <p className="text-gray-600">
        Review your items and proceed to checkout when ready
      </p>
    </div>
  );
}
