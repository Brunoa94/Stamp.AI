const PROCESS_STEP_ACCENTS = [
  "from-[#7C3AED]/30 to-[#06B6D4]/20",
  "from-[#06B6D4]/30 to-[#7C3AED]/20",
  "from-[#FF8C42]/30 to-[#7C3AED]/20",
  "from-[#4F46E5]/30 to-[#06B6D4]/20",
  "from-[#D946EF]/30 to-[#7C3AED]/20",
  "from-[#06B6D4]/30 to-[#FF8C42]/20",
] as const;

const PROCESS_STEP_DESKTOP_STATE_CLASSES = {
  active:
    "z-20 scale-[1.06] border-[#7C3AED] bg-linear-to-br from-[#7C3AED]/26 via-white to-[#06B6D4]/24 ring-2 ring-[#7C3AED]/50 shadow-2xl shadow-purple-500/50",
  passed:
    "opacity-85 border-[#7C3AED]/30 bg-linear-to-br from-[#7C3AED]/12 via-white/90 to-[#FF8C42]/10",
  idle: "opacity-70 border-slate-200/85 bg-linear-to-br from-white/90 via-slate-50/85 to-[#06B6D4]/10",
} as const;

const PROCESS_STEP_MOBILE_STATE_CLASSES = {
  active:
    "scale-[1.05] border-[#7C3AED] bg-linear-to-br from-[#7C3AED]/26 via-white to-[#06B6D4]/24 ring-2 ring-[#7C3AED]/50 shadow-xl shadow-purple-500/40",
  passed:
    "opacity-85 border-[#7C3AED]/30 bg-linear-to-br from-[#7C3AED]/12 via-white/90 to-[#FF8C42]/10",
  idle: "opacity-70 border-slate-200/85 bg-linear-to-br from-white/90 via-slate-50/85 to-[#06B6D4]/10",
} as const;

interface ProcessStepProgressState {
  isActive: boolean;
  isPassed: boolean;
}

type ProcessStepCardVariant = "desktop" | "mobile";

interface ProcessStepVisualState {
  isActive: boolean;
  isPassed: boolean;
  stepAccent: string;
  cardStateClass: string;
}

export function mapProcessStepIndexToAccent(index: number): string {
  const safeIndex =
    ((index % PROCESS_STEP_ACCENTS.length) + PROCESS_STEP_ACCENTS.length) %
    PROCESS_STEP_ACCENTS.length;

  return PROCESS_STEP_ACCENTS[safeIndex];
}

export function mapProcessStepProgressState(
  index: number,
  activeProcessStep: number,
): ProcessStepProgressState {
  return {
    isActive: index === activeProcessStep,
    isPassed: index < activeProcessStep,
  };
}

export function mapProcessStepCardStateClass(
  state: ProcessStepProgressState,
  variant: ProcessStepCardVariant,
): string {
  const classes =
    variant === "desktop"
      ? PROCESS_STEP_DESKTOP_STATE_CLASSES
      : PROCESS_STEP_MOBILE_STATE_CLASSES;

  if (state.isActive) return classes.active;
  if (state.isPassed) return classes.passed;
  return classes.idle;
}

export function mapProcessStepVisualState(
  index: number,
  activeProcessStep: number,
  variant: ProcessStepCardVariant,
): ProcessStepVisualState {
  const progressState = mapProcessStepProgressState(index, activeProcessStep);

  return {
    ...progressState,
    stepAccent: mapProcessStepIndexToAccent(index),
    cardStateClass: mapProcessStepCardStateClass(progressState, variant),
  };
}
