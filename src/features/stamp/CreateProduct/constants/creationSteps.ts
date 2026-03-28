import { Palette, Layers, Package, CheckCircle2 } from "lucide-react";

export const CREATION_STEPS = [
  { Icon: Palette, label: "Applying your design", delay: "0s" },
  { Icon: Layers, label: "Configuring variants", delay: "0.8s" },
  { Icon: Package, label: "Preparing your product", delay: "1.6s" },
  { Icon: CheckCircle2, label: "Almost done!", delay: "2.4s" },
] as const;
