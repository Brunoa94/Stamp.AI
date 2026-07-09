"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CartContent } from "@/features/cart/ui/CartContent";
import "@/features/cart/ui/cart.css";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
