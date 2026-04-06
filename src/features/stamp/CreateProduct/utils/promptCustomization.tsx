import {
  Binary,
  Brush,
  CircleOff,
  Cpu,
  Palette,
  Sparkles,
  Square,
} from "lucide-react";

export type ArtStyleId =
  | "na"
  | "anime"
  | "scifi"
  | "cyberpunk"
  | "minimalist"
  | "watercolor"
  | "oil"
  | "comic";

export function getPreservationBoxStyle(preservation: number): string {
  if (preservation <= 30) {
    return "linear-gradient(135deg, #F07848, #d3643b)";
  }

  if (preservation >= 70) {
    return "linear-gradient(135deg, #4DD9E8, #36b9c8)";
  }

  return "linear-gradient(135deg, #7B5CF5, rgba(123, 92, 245, 0.9))";
}

export function getArtStyleIcon(styleId: ArtStyleId) {
  switch (styleId) {
    case "na":
      return <CircleOff className="h-7 w-7 text-[#1A2340]/70" />;
    case "anime":
      return <Sparkles className="h-7 w-7 text-white" />;
    case "scifi":
      return <Binary className="h-7 w-7 text-white" />;
    case "cyberpunk":
      return <Cpu className="h-7 w-7 text-white" />;
    case "minimalist":
      return <Square className="h-7 w-7 text-[#1A2340]/80" />;
    case "watercolor":
      return <Brush className="h-7 w-7 text-white" />;
    case "oil":
      return <Palette className="h-7 w-7 text-white" />;
    case "comic":
      return <Sparkles className="h-7 w-7 text-[#1A2340]/80" />;
    default:
      return <Sparkles className="h-7 w-7 text-white" />;
  }
}
