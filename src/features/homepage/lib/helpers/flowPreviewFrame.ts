import {
  FLOW_CUES,
  FLOW_PRINT_SIZES,
  FLOW_STEPS,
} from "@/features/homepage/lib/constants/flowPreview";
import type {
  FlowFrameType,
  FlowPositionType,
  FlowPrintSizeType,
  FlowRailStatusType,
  FlowStepIdType,
  FlowToastType,
} from "@/features/homepage/lib/types/flowPreview";

/** Position of a step in FLOW_STEPS */
export function getFlowStepIndex(stepId: FlowStepIdType): number {
  return FLOW_STEPS.findIndex((step) => step.id === stepId);
}

/** How many ticks a step stays on screen; the describe step waits for the prompt to be typed */
export function getStepDurationTicks(stepIndex: number, promptLength: number): number {
  const step = FLOW_STEPS[stepIndex];
  return step.id === "describe" ? step.baseTicks + promptLength : step.baseTicks;
}

/** Advances one tick, moving to the next step (and looping) once the current one ends */
export function getNextPosition(
  position: FlowPositionType,
  promptLength: number,
): FlowPositionType {
  if (position.tick < getStepDurationTicks(position.stepIndex, promptLength)) {
    return { stepIndex: position.stepIndex, tick: position.tick + 1 };
  }
  return { stepIndex: (position.stepIndex + 1) % FLOW_STEPS.length, tick: 0 };
}

function getToast(stepId: FlowStepIdType, tick: number): FlowToastType {
  if (stepId === "upload" && tick > FLOW_CUES.uploadToastFrom && tick < FLOW_CUES.uploadToastTo) {
    return "uploaded";
  }
  if (stepId === "final" && tick > FLOW_CUES.bagAt) return "bagged";
  return null;
}

function getPrintSize(stepId: FlowStepIdType, tick: number): FlowPrintSizeType {
  const isEnlarged =
    stepId === "customize" && tick > FLOW_CUES.sizeUpFrom && tick < FLOW_CUES.sizeUpTo;
  return FLOW_PRINT_SIZES[isEnlarged ? 1 : 0];
}

/** Derives what the active step shows at a given tick */
export function getFlowFrame(
  stepIndex: number,
  tick: number,
  promptLength: number,
): FlowFrameType {
  const stepId = FLOW_STEPS[stepIndex].id;
  const typedCount = stepId === "describe" ? Math.min(tick, promptLength) : 0;

  return {
    isUploaded: stepId === "upload" && tick > FLOW_CUES.uploadAt,
    typedCount,
    isPromptComplete: typedCount >= promptLength,
    progressPct: Math.min(100, Math.round((tick / FLOW_CUES.progressTicks) * 100)),
    isUseHighlighted: stepId === "results" && tick > FLOW_CUES.useHighlightAt,
    isTeeSelected: stepId === "product" && tick > FLOW_CUES.teeSelectAt,
    printSize: getPrintSize(stepId, tick),
    rotationIndex: stepId === "customize" && tick > FLOW_CUES.rotateAt ? 1 : 0,
    isBagged: stepId === "final" && tick > FLOW_CUES.bagAt,
    toast: getToast(stepId, tick),
  };
}

/** Status of a step in the step list relative to the playing step */
export function getRailStatus(stepIndex: number, activeStepIndex: number): FlowRailStatusType {
  if (stepIndex < activeStepIndex) return "done";
  if (stepIndex === activeStepIndex) return "active";
  return "upcoming";
}
