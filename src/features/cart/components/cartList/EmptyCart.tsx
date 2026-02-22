"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { componentThemes } from "@/theme";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-slate-600" />
      </div>

      <h2 className={componentThemes.text.heading}>Your cart is empty</h2>

      <p className="text-gray-600 mt-2 mb-8 max-w-md">
        Looks like you haven't added anything to your cart yet. Start shopping
        to find amazing products!
      </p>

      <Link
        href="/products"
        className="px-6 py-3 bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Start Shopping
      </Link>
    </div>
  );
}
