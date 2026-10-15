"use client";

/**
 * FlowPreview
 *
 * Animated walkthrough of the creation flow: a mock browser window that plays
 * all eight steps (upload → final) on a loop. Pauses off-screen; holds still
 * for reduced motion.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { FLOW_STEPS } from "@/features/homepage/lib/constants/flowPreview";
import { getFlowFrame } from "@/features/homepage/lib/helpers/flowPreviewFrame";
import { useFlowPreviewTimeline } from "@/features/homepage/lib/hooks/useFlowPreviewTimeline";
import { FlowPreviewWindow } from "./Window/FlowPreviewWindow";
import { FlowPreviewStage } from "./Window/FlowPreviewStage";

interface PropsI {
  className?: string;
}

export function FlowPreview({ className }: PropsI) {
  const t = useTranslations("home.flowPreview");
  const prompt = t("describe.prompt");
  const isReducedMotion = useReducedMotion();
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.2,
    triggerOnce: false,
  });
  const { stepIndex, tick } = useFlowPreviewTimeline({
    promptLength: prompt.length,
    isPlaying: isVisible,
    isStatic: isReducedMotion,
  });

  const step = FLOW_STEPS[stepIndex];
  const frame = getFlowFrame(stepIndex, tick, prompt.length);

  return (
    <div
      ref={ref}
      className={cn("flow-preview flex flex-col items-center gap-5", className)}
    >
      <FlowPreviewWindow
        label={t("windowLabel")}
        stepTag={t("stepTag", {
          number: step.number,
          name: t(`steps.${step.id}.tag`),
        })}
      >
        <FlowPreviewStage stepId={step.id} frame={frame} prompt={prompt} />
      </FlowPreviewWindow>
    </div>
  );
}
