export type FlowStepIdType =
  | "upload"
  | "describe"
  | "process"
  | "results"
  | "product"
  | "customize"
  | "creation"
  | "final";

export type FlowStepType = {
  id: FlowStepIdType;
  /** Two-digit label shown in the window tag and the rail ("01") */
  number: string;
  /** Ticks the step stays on screen (the describe step adds the prompt length) */
  baseTicks: number;
};

/** Where the demo timeline currently is */
export type FlowPositionType = {
  stepIndex: number;
  tick: number;
};

export type FlowPrintSizeType = {
  pct: number;
  /** Where the size slider knob sits for this preset (0–100) */
  knobPct: number;
};

export type FlowToastType = "uploaded" | "bagged" | null;

/** Everything the steps need to draw one frame of the demo */
export type FlowFrameType = {
  isUploaded: boolean;
  typedCount: number;
  isPromptComplete: boolean;
  progressPct: number;
  isUseHighlighted: boolean;
  isTeeSelected: boolean;
  printSize: FlowPrintSizeType;
  rotationIndex: number;
  isBagged: boolean;
  toast: FlowToastType;
};

export type FlowRailStatusType = "done" | "active" | "upcoming";

export type FlowProductIdType = "kidsTee" | "hoodie" | "softTee" | "mug";

export type FlowProductArtType = "tee" | "hoodie" | "mug";

/** Illustration assets under public/assets/flow-preview */
export type FlowArtIdType = FlowProductArtType | "teePrintArea" | "pup" | "pupPhoto";

export type FlowArtAssetType = {
  src: string;
  /** Intrinsic size, matching the SVG viewBox */
  width: number;
  height: number;
};

export type FlowMockButtonToneType = "dark" | "gold" | "muted" | "pressed" | "outline";

export type FlowGeneratingToneType = "dark" | "light";

/** Backdrop behind the product art */
export type FlowProductBackdropType = "sage" | "sand";

export type FlowProductType = {
  id: FlowProductIdType;
  art: FlowProductArtType;
  backdrop: FlowProductBackdropType;
};

/** Text size of a mock field label: "sm" in dense screens, "md" elsewhere */
export type FlowLabelSizeType = "sm" | "md";
