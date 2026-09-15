import { Suspense } from "react";
import { CheckEmailContent } from "@/features/auth/checkEmail/CheckEmailContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Your Email | Stamp.AI",
  description: "Confirm your email address to activate your Stamp.AI account.",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--color-stamp-cream)">
          <div className="w-16 h-16 border-4 border-(--color-stamp-gold) border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
