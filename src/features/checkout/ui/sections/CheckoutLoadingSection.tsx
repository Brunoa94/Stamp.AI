/**
 * CheckoutLoadingSection
 *
 * Skeleton loading state for the checkout page, matching the shimmer
 * treatment used across the orders/cart luxury pages.
 */

import { useTranslations } from "next-intl";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`checkout-shimmer bg-linear-to-r from-(--color-stamp-cream) via-(--color-stamp-divider) to-(--color-stamp-cream) bg-size-[200%_100%] animate-[checkout-shimmer_1.5s_linear_infinite] ${className ?? ""}`}
    />
  );
}

export function CheckoutLoadingSection() {
  const t = useTranslations("checkout.loading");
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) px-6 pb-24 pt-12 lg:px-12 xl:px-24">
      <div
        role="status"
        aria-busy="true"
        aria-label={t("loadingAria")}
        className="mx-auto max-w-6xl space-y-12"
      >
        <div className="space-y-4">
          <ShimmerBlock className="h-1.5 w-20" />
          <ShimmerBlock className="h-16 w-1/2" />
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-7">
            <ShimmerBlock className="h-72 w-full" />
            <ShimmerBlock className="h-72 w-full" />
          </div>
          <div className="lg:col-span-5">
            <ShimmerBlock className="h-96 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
