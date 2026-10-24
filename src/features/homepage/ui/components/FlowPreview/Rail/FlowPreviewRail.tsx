"use client";

import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { cn } from "@/lib/utils";
import { FLOW_STEPS } from "@/features/homepage/lib/constants/flowPreview";
import { getRailStatus } from "@/features/homepage/lib/helpers/flowPreviewFrame";
import { FlowRailItem } from "./FlowRailItem";

interface PropsI {
  activeStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
  className?: string;
}

/**
 * FlowPreviewRail
 *
 * Compact step list under the flow demo window. Tracks the playing step and
 * lets the visitor jump straight to any step.
 */
export function FlowPreviewRail({ activeStepIndex, onSelectStep, className }: PropsI) {
  const t = useTranslations("home.flowPreview");

  return (
    <nav aria-label={t("railTitle")} className={cn("w-full max-w-160", className)}>
      <List as="ol" className="flex flex-wrap justify-center gap-x-5">
        {FLOW_STEPS.map((step, index) => (
          <FlowRailItem
            key={step.id}
            label={`${step.number} ${t(`steps.${step.id}.rail`)}`}
            status={getRailStatus(index, activeStepIndex)}
            onSelect={() => onSelectStep(index)}
          />
        ))}
      </List>
    </nav>
  );
}
