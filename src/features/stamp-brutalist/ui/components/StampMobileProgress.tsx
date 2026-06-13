"use client";

import { Span } from "@/features/ui/span";
import { useStampFlowStore } from "../../lib/context/StampFormContext";
import { useStampProgress } from "../../lib/hooks/useStampProgress";

export function StampMobileProgress() {
  const currentStep = useStampFlowStore((s) => s.currentStep);
  const progress = useStampProgress();

  return (
    <div className="lg:hidden flex flex-col items-end">
      <Span variant="micro" className="opacity-40 uppercase">
        Protocol {currentStep?.toString().padStart(2, "0") || "01"}
      </Span>
      <div className="w-24 h-1 bg-ink/5 mt-1 rounded-full overflow-hidden">
        <div
          className="h-full bg-brandCyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
