import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CheckoutPageContent } from "@/features/checkout/ui/CheckoutPageContent";
import { CheckoutLoading } from "@/features/checkout/ui/Checkout/CheckoutLoading";

export default function CheckoutPage() {
  return (
    <ProtectedRoute fallback={<CheckoutLoading />}>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
