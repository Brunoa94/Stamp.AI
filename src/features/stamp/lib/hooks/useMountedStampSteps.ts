import { useState } from "react";
import { getMountedStampSteps } from "../helpers/stampStepMounting";

/** Steps in the flow, 00 entry to 08 final review */
const STAMP_STEP_COUNT = 9;

/**
 * The flow steps StampCanvas renders for the active step: visited steps plus
 * the active step's neighbours (see getMountedStampSteps). Visited steps are
 * remembered across renders, adjusting state during render as React
 * recommends for state derived from a changing prop.
 */
export function useMountedStampSteps(activeStep: number): Set<number> {
  const [visitedSteps, setVisitedSteps] = useState<ReadonlySet<number>>(() => new Set([activeStep]));

  if (!visitedSteps.has(activeStep)) {
    setVisitedSteps(new Set(visitedSteps).add(activeStep));
  }

  return getMountedStampSteps(activeStep, visitedSteps, STAMP_STEP_COUNT);
}
