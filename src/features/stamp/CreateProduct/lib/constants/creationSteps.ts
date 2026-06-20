import { Layers, Package, Palette, Sparkles } from "lucide-react";

export type CreationStepStatus = "completed" | "active" | "upcoming";

export const CREATION_STEPS = [
  {
    Icon: Palette,
    label: "Applying your design",
    delay: "0s",
    status: "completed" as CreationStepStatus,
  },
  {
    Icon: Layers,
    label: "Configuring variants",
    delay: "0.2s",
    status: "completed" as CreationStepStatus,
  },
  {
    Icon: Package,
    label: "Preparing your product",
    delay: "0.4s",
    status: "active" as CreationStepStatus,
  },
  {
    Icon: Sparkles,
    label: "Almost done!",
    delay: "0.6s",
    status: "upcoming" as CreationStepStatus,
  },
] as const;
