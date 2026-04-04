import { UploadCloud, Sparkles, Eye, Shirt, Maximize } from "lucide-react";
import { WizardStepConfig } from "@/features/ui/wizard-sidebar";

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: "upload",
    icon: UploadCloud,
    title: "Upload Artwork",
    description: "Start with inspiration",
  },
  {
    id: "synthesis",
    icon: Sparkles,
    title: "AI Synthesis",
    description: "Refine the concept",
  },
  {
    id: "review",
    icon: Eye,
    title: "Final Review",
    description: "Check every detail",
  },
  {
    id: "fabric",
    icon: Shirt,
    title: "Fabric Style",
    description: "Select the material",
  },
  {
    id: "sizing",
    icon: Maximize,
    title: "Sizing & Fit",
    description: "Perfect for you",
  },
];
