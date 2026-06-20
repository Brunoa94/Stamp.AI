"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CartContent } from "@/features/cart/ui/CartContent";
import "@/features/cart/ui/cart.css";

export default function CartPage() {
  return (
    <div className="bg-concrete text-ink font-space antialiased min-h-screen">
      <ProtectedRoute>
        <CartContent />
      </ProtectedRoute>
    </div>
  );
}
