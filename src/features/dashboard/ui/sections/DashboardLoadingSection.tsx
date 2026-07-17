/**
 * DashboardLoadingSection
 *
 * Shimmer skeleton mirroring the dashboard grid while data resolves.
 */

import { useTranslations } from "next-intl";

const SHIMMER_CLASS =
  "border border-(--color-stamp-divider) bg-linear-to-r from-(--color-stamp-cream) via-(--color-stamp-divider) to-(--color-stamp-cream) bg-size-[200%_100%] animate-[dashboard-shimmer_1.5s_linear_infinite]";

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
        <div className={`h-64 w-full ${SHIMMER_CLASS}`} />
        <div className={`h-72 w-full ${SHIMMER_CLASS}`} />
        <div className={`h-48 w-full ${SHIMMER_CLASS}`} />
      </div>
      <div className="flex flex-col gap-8 xl:col-span-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className={`h-64 w-full ${SHIMMER_CLASS}`} />
          <div className={`h-64 w-full ${SHIMMER_CLASS}`} />
        </div>
        <div className={`h-56 w-full ${SHIMMER_CLASS}`} />
        <div className={`h-96 w-full ${SHIMMER_CLASS}`} />
      </div>
    </div>
  );
}
