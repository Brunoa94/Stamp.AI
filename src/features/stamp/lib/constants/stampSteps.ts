import type { StampStepType } from "../types/stampTypes";

/**
 * Stamp Step Configuration
 *
 * Defines the 8-stage synthesis protocol steps.
 * Display strings (title, label) are translated — see `stamp.steps.<id>`
 * in the message catalog. Only structural fields (id, number) live here.
 */

export const STAMP_TOTAL_STEPS = 8;

export const STAMP_STEPS: StampStepType[] = [
  { id: "hero", number: "00" },
  { id: "step-1", number: "01" },
  { id: "step-2", number: "02" },
  { id: "step-3", number: "03" },
  { id: "step-4", number: "04" },
  { id: "step-5", number: "05" },
  { id: "step-6", number: "06" },
  { id: "step-7", number: "07" },
  { id: "step-8", number: "08" },
];
