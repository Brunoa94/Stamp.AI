import { Eye, Maximize, Shirt, Sparkles, UploadCloud } from "lucide-react";

export const MOBILE_STEPS = [
  { id: "upload", label: "Upload", Icon: UploadCloud },
  { id: "synthesis", label: "Synthesis", Icon: Sparkles },
  { id: "review", label: "Review", Icon: Eye },
  { id: "fabric", label: "Fabric", Icon: Shirt },
  { id: "sizing", label: "Sizing", Icon: Maximize },
] as const;
