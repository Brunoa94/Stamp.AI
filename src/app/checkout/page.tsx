"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CheckoutContent } from "@/features/checkout/ui/CheckoutContent";
import { CheckoutLoadingSection } from "@/features/checkout/ui/sections/CheckoutLoadingSection";
import "@/features/checkout/ui/checkout.css";

export default function CheckoutPage() {
  return (
    <ProtectedRoute fallback={<CheckoutLoadingSection />}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
