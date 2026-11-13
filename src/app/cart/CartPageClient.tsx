"use client";

import { Suspense } from "react";
import { CartContent } from "@/features/cart/ui/CartContent";
import { LoginRedirectPrompt } from "@/features/auth/components/LoginRedirectPrompt";
import "@/features/cart/ui/cart.css";

export default function CartPageClient() {
  return (
    <>
      <CartContent />
      {/* Checking out items saved to an account opens login here (?redirectedFrom=/cart).
          useSearchParams() requires a Suspense boundary for static prerendering. */}
      <Suspense fallback={null}>
        <LoginRedirectPrompt />
      </Suspense>
    </>
  );
}
