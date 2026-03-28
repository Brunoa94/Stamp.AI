import { Sparkles, ImageIcon, Cpu } from "lucide-react";

export const ORBIT_ICONS = [
  {
    Icon: Sparkles,
    label: "sparkles",
    color: "text-violet-400",
    delay: "0s",
    angle: 0,
  },
  {
    Icon: ImageIcon,
    label: "image",
    color: "text-indigo-400",
    delay: "-1.5s",
    angle: 120,
  },
  {
    Icon: Cpu,
    label: "cpu",
    color: "text-purple-400",
    delay: "-3s",
    angle: 240,
  },
] as const;
