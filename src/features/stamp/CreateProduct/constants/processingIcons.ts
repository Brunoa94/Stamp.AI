import { Sparkles, SlidersHorizontal, Layers, Palette } from "lucide-react";

export const ORBIT_ICONS = [
  {
    Icon: Sparkles,
    label: "sparkles",
    delay: "0s",
  },
  {
    Icon: SlidersHorizontal,
    label: "sliders",
    delay: "-2s",
  },
  {
    Icon: Layers,
    label: "layers",
    delay: "-4s",
  },
  {
    Icon: Palette,
    label: "palette",
    delay: "-6s",
  },
] as const;
