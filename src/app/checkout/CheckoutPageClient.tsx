"use client";

import { Suspense } from "react";
import { CheckoutContent } from "@/features/checkout/ui/CheckoutContent";
import { CheckoutLoadingSection } from "@/features/checkout/ui/sections/CheckoutLoadingSection";
import "@/features/checkout/ui/checkout.css";

export default function CheckoutPageClient() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={<CheckoutLoadingSection />}>
      <CheckoutContent />
    </Suspense>
  );
}
