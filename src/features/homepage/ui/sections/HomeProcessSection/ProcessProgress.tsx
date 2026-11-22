/**
 * ProcessProgress
 *
 * Progress through "The Process" carousel: a gold bar that fills as the
 * track slides, and the current step out of the total.
 */

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

interface PropsI {
  progress: number;
  activeIndex: number;
  total: number;
}

export function ProcessProgress({ progress, activeIndex, total }: PropsI) {
  const t = useTranslations("home.process");

  return (
    <div className="flex items-center gap-4">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-(--color-stamp-chocolate)/10">
        <div
          className="h-full origin-left bg-(--color-stamp-gold)"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <Span variant="micro" className="shrink-0 text-(--color-stamp-taupe)">
        {t("stepCounter", { current: activeIndex + 1, total })}
      </Span>
    </div>
  );
}
