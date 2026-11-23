/**
 * CartLoadingSection
 *
 * Skeleton loading state below the cart header band: rounded cream →
 * divider → cream shimmer blocks shaped like the item cards and the summary.
 */

import { useTranslations } from "next-intl";

const SKELETON_ROWS = 3;

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`cart-shimmer bg-linear-to-r from-(--color-stamp-cream) via-(--color-stamp-divider) to-(--color-stamp-cream) bg-size-[200%_100%] animate-[cart-shimmer_1.5s_linear_infinite] ${className ?? ""}`}
    />
  );
}

export function CartLoadingSection() {
  const t = useTranslations("cart.loading");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("label")}
      className="grid grid-cols-1 gap-8 xl:col-span-12 xl:grid-cols-12 xl:gap-12"
    >
      <div className="space-y-6 xl:col-span-8">
        <ShimmerBlock className="h-10 w-full rounded-lg" />
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <ShimmerBlock key={index} className="h-48 w-full rounded-xl" />
        ))}
      </div>
      <div className="xl:col-span-4">
        <ShimmerBlock className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
