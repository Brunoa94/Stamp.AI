import { cva } from "class-variance-authority";

/** Animated shimmer block used by the dashboard loading skeleton. */
export const dashboardShimmerVariants = cva(
  "w-full border border-(--color-stamp-divider) bg-linear-to-r from-(--color-stamp-cream) via-(--color-stamp-divider) to-(--color-stamp-cream) bg-size-[200%_100%] animate-[dashboard-shimmer_1.5s_linear_infinite]",
);
