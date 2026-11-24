/**
 * CheckoutLoadingSection
 *
 * Skeleton loading state for the checkout page, shaped like the real page:
 * a rounded-2xl header band, then card-shaped blocks for the forms and the
 * summary, in the page gutter below the fixed header. Same shimmer as the
 * cart's.
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
    <div className="min-h-screen bg-(--color-stamp-off-white) px-4 pb-16 pt-28 sm:px-6 lg:px-12">
      <div
        role="status"
        aria-busy="true"
        aria-label={t("loadingAria")}
        className="mx-auto max-w-screen-2xl space-y-16"
      >
        <ShimmerBlock className="h-56 w-full rounded-2xl xl:h-64" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-7">
            <ShimmerBlock className="h-72 w-full rounded-xl" />
            <ShimmerBlock className="h-72 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <ShimmerBlock className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
