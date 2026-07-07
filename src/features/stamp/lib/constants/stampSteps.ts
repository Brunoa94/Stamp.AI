import type { StampStepType } from "../types/stampTypes";

/**
 * Stamp Step Configuration
 *
 * Defines the 8-stage synthesis protocol steps
 */

export const STAMP_TOTAL_STEPS = 8;

export const STAMP_STEPS: StampStepType[] = [
  {
    id: "hero",
    number: "00",
    title: "Entry",
    label: "Archive Access",
  },
  {
    id: "step-1",
    number: "01",
    title: "Upload",
    label: "Protocol 01 / Initiation",
  },
  {
    id: "step-2",
    number: "02",
    title: "Synthesis",
    label: "Protocol 02 / Logic",
  },
  {
    id: "step-3",
    number: "03",
    title: "Process",
    label: "Protocol 03 / Generation",
  },
  {
    id: "step-4",
    number: "04",
    title: "Results",
    label: "Protocol 04 / Output",
  },
  {
    id: "step-5",
    number: "05",
    title: "Product",
    label: "Protocol 05 / Canvas",
  },
  {
    id: "step-6",
    number: "06",
    title: "Custom",
    label: "Protocol 06 / Refinement",
  },
  {
    id: "step-7",
    number: "07",
    title: "Creation",
    label: "Protocol 07 / Production",
  },
  {
    id: "step-8",
    number: "08",
    title: "Final",
    label: "Protocol 08 / Acquisition",
  },
];
