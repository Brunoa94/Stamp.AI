"use client";

import { Shimmer } from "@/features/ui/shimmer";

export function WizardStepLoadingState() {
  return (
    <div
      className="h-full w-full flex flex-col justify-center gap-6 px-2 sm:px-0"
      role="status"
      aria-live="polite"
      aria-label="Loading step"
    >
      <div className="space-y-3">
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-2/3" />
      </div>

      <div className="space-y-4 rounded-2xl border border-white/30 bg-white/35 p-5 sm:p-6">
        <Shimmer className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Shimmer className="h-10 w-full rounded-lg" />
          <Shimmer className="h-10 w-full rounded-lg" />
        </div>
        <Shimmer className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
