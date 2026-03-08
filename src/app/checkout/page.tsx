import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CheckoutSubscriberProvider } from "@/features/checkout/context";
import { CheckoutContent } from "@/features/checkout/CheckoutContent";
import { CheckoutLoading } from "@/features/checkout/components";

export default function CheckoutPage() {
  return (
    <ProtectedRoute fallback={<CheckoutLoading />}>
      <CheckoutSubscriberProvider>
        <CheckoutContent />
      </CheckoutSubscriberProvider>
    </ProtectedRoute>
  );
}
