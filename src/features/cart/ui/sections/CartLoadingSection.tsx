/**
 * CartLoadingSection
 *
 * Skeleton loading state matching the orders/stamp shimmer treatment:
 * cream → divider → cream gradient sweeping across placeholder blocks.
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
      className="space-y-12 xl:col-span-12"
    >
      <div className="space-y-4">
        <ShimmerBlock className="h-1.5 w-20" />
        <ShimmerBlock className="h-16 w-2/3" />
      </div>
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 xl:gap-20">
        <div className="space-y-8 xl:col-span-8">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <ShimmerBlock key={index} className="h-48 w-full" />
          ))}
        </div>
        <div className="xl:col-span-4">
          <ShimmerBlock className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
