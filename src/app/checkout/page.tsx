import type { Metadata } from "next";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CheckoutContent } from "@/features/checkout/ui/CheckoutContent";
import { CheckoutLoadingSection } from "@/features/checkout/ui/sections/CheckoutLoadingSection";
import "@/features/checkout/ui/checkout.css";

export const metadata: Metadata = {
  title: "Checkout | Stamp AI",
  description: "Complete your order for custom AI-designed apparel. Secure payment.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute fallback={<CheckoutLoadingSection />}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
