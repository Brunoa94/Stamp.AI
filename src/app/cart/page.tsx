"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CartContent } from "@/features/cart/CartContent";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
