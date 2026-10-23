"use client";

/**
 * ProcessFlowSnapshot
 *
 * One screen of the hero's creation-flow demo, in its starting state and framed
 * in the same mock browser window, illustrating a "The Process" step. Rendered at the demo's
 * native size; callers scale it to fit through `className`.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PROCESS_STEP_FLOW_STEP_IDS } from "@/features/homepage/lib/constants/flowPreview";
import type { HomeProcessStepType } from "@/features/homepage/lib/constants/homepageContent";
import { getFlowFrame, getFlowStepIndex } from "@/features/homepage/lib/helpers/flowPreviewFrame";
import { FlowPreviewWindow } from "../FlowPreview/Window/FlowPreviewWindow";
import { FlowPreviewStage } from "../FlowPreview/Window/FlowPreviewStage";

interface PropsI {
  step: HomeProcessStepType;
  /** Accessible name for the screen */
  label: string;
  className?: string;
}

export function ProcessFlowSnapshot({ step, label, className }: PropsI) {
  const t = useTranslations("home.flowPreview");
  const prompt = t("describe.prompt");
  const flowStepId = PROCESS_STEP_FLOW_STEP_IDS[step.id];
  const frame = getFlowFrame(getFlowStepIndex(flowStepId), 0, prompt.length);

  return (
    <div className={cn("flow-preview w-160 shrink-0", className)}>
      <FlowPreviewWindow
        label={label}
        stepTag={t("stepTag", {
          number: step.number,
          name: t(`steps.${flowStepId}.tag`),
        })}
      >
        <FlowPreviewStage stepId={flowStepId} frame={frame} prompt={prompt} />
      </FlowPreviewWindow>
    </div>
  );
}
