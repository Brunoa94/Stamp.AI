"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CheckoutV2Content } from "@/features/checkout-v2/ui/CheckoutV2Content";
import { CheckoutV2LoadingSection } from "@/features/checkout-v2/ui/sections/CheckoutV2LoadingSection";
import "@/features/checkout-v2/ui/checkout-v2.css";

export default function CheckoutV2Page() {
  return (
    <ProtectedRoute fallback={<CheckoutV2LoadingSection />}>
      <CheckoutV2Content />
    </ProtectedRoute>
  );
}
