import type { Metadata } from "next";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CartContent } from "@/features/cart/ui/CartContent";
import "@/features/cart/ui/cart.css";

export const metadata: Metadata = {
  title: "Shopping Cart | Stamp AI",
  description: "Review your custom AI-designed apparel before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
