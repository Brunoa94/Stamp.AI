/**
 * DashboardLoadingSection
 *
 * Shimmer skeleton mirroring the dashboard grid while data resolves.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dashboardShimmerVariants } from "@/features/dashboard/lib/variants/dashboardShimmerVariants";

export function DashboardLoadingSection() {
  const t = useTranslations("dashboard.loading");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("label")}
      className="grid grid-cols-1 gap-8 xl:grid-cols-12"
    >
      <div className="flex flex-col gap-8 xl:col-span-4">
        <div className={cn("h-64", dashboardShimmerVariants())} />
        <div className={cn("h-72", dashboardShimmerVariants())} />
        <div className={cn("h-48", dashboardShimmerVariants())} />
      </div>
      <div className="flex flex-col gap-8 xl:col-span-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className={cn("h-64", dashboardShimmerVariants())} />
          <div className={cn("h-64", dashboardShimmerVariants())} />
        </div>
        <div className={cn("h-56", dashboardShimmerVariants())} />
        <div className={cn("h-96", dashboardShimmerVariants())} />
      </div>
    </div>
  );
}
