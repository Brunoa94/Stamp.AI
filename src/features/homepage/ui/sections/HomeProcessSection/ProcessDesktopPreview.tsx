/**
 * ProcessDesktopPreview
 *
 * Desktop flow-demo screen for a process step with slide animation.
 */

import type { HomeProcessStepType } from "../../../lib/constants/homepageContent";
import { ProcessFlowSnapshot } from "./ProcessFlowSnapshot";

interface ProcessDesktopPreviewPropsI {
  step: HomeProcessStepType;
  label: string;
  translateY: number;
  opacity: number;
  zIndex: number;
}

export function ProcessDesktopPreview({
  step,
  label,
  translateY,
  opacity,
  zIndex,
}: ProcessDesktopPreviewPropsI) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex,
      }}
    >
      <ProcessFlowSnapshot step={step} label={label} className="scale-85 xl:scale-100" />
    </div>
  );
}
