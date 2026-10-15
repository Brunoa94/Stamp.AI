import type {
  FlowArtAssetType,
  FlowArtIdType,
  FlowPrintSizeType,
  FlowProductType,
  FlowStepIdType,
  FlowStepType,
} from "@/features/homepage/lib/types/flowPreview";

/** One timeline tick; every duration below is counted in ticks */
export const FLOW_TICK_MS = 50;

export const FLOW_STEPS: readonly FlowStepType[] = [
  { id: "upload", number: "01", baseTicks: 70 },
  { id: "describe", number: "02", baseTicks: 30 },
  { id: "process", number: "03", baseTicks: 56 },
  { id: "results", number: "04", baseTicks: 70 },
  { id: "product", number: "05", baseTicks: 70 },
  { id: "customize", number: "06", baseTicks: 90 },
  { id: "creation", number: "07", baseTicks: 56 },
  { id: "final", number: "08", baseTicks: 90 },
];

/** Tick marks inside a step where the scripted "user" acts */
export const FLOW_CUES = {
  uploadAt: 22,
  uploadToastFrom: 26,
  uploadToastTo: 64,
  progressTicks: 50,
  useHighlightAt: 45,
  teeSelectAt: 25,
  sizeUpFrom: 20,
  sizeUpTo: 50,
  rotateAt: 60,
  bagAt: 40,
} as const;

export const FLOW_PROMPT_MAX_CHARS = 500;

/** Print size presets; the scripted user bumps the print to the second one */
export const FLOW_PRINT_SIZES: readonly FlowPrintSizeType[] = [
  { pct: 100, knobPct: 50 },
  { pct: 120, knobPct: 64 },
];

export const FLOW_ROTATIONS_DEG = [0, 90, 180, 270] as const;

/** Garment colors offered in the customize step; the first is selected */
export const FLOW_SWATCHES = ["White", "Black"] as const;

export const FLOW_PRODUCTS: readonly FlowProductType[] = [
  { id: "kidsTee", art: "tee", backdrop: "sage" },
  { id: "hoodie", art: "hoodie", backdrop: "sage" },
  { id: "softTee", art: "tee", backdrop: "sage" },
  { id: "mug", art: "mug", backdrop: "sand" },
];

/** Carousel dots under the final mockup; the first is current */
export const FLOW_MOCKUP_DOTS = [0, 1, 2, 3] as const;

/** Demo illustrations (product blanks and the sample dog design) */
export const FLOW_ART_ASSETS: Record<FlowArtIdType, FlowArtAssetType> = {
  tee: { src: "/assets/flow-preview/tee.svg", width: 340, height: 320 },
  teePrintArea: { src: "/assets/flow-preview/tee-print-area.svg", width: 340, height: 320 },
  hoodie: { src: "/assets/flow-preview/hoodie.svg", width: 340, height: 340 },
  mug: { src: "/assets/flow-preview/mug.svg", width: 320, height: 300 },
  pup: { src: "/assets/flow-preview/pup.svg", width: 100, height: 100 },
  pupPhoto: { src: "/assets/flow-preview/pup-photo.svg", width: 120, height: 120 },
};

/**
 * The demo screen shown, in its starting state, for each "The Process" step
 * (keyed by HOME_PROCESS_STEPS id)
 */
export const PROCESS_STEP_FLOW_STEP_IDS: Record<string, FlowStepIdType> = {
  "step-upload": "upload",
  "step-describe": "describe",
  "step-results": "results",
  "step-product": "product",
  "step-customize": "customize",
  "step-create": "final",
};
