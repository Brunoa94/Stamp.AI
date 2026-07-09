"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CartV2Content } from "@/features/cart-v2/ui/CartV2Content";
import "@/features/cart-v2/ui/cart-v2.css";

export default function CartV2Page() {
  return (
    <ProtectedRoute>
      <CartV2Content />
    </ProtectedRoute>
  );
}
