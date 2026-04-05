import { WizardStepConfig } from "@/features/ui/wizard-sidebar";
import {
  UploadArtworkIcon,
  AISynthesisIcon,
  FinalReviewIcon,
  FabricStyleIcon,
  SizingFitIcon,
} from "../components/WizardStepIcons";

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: "upload",
    icon: UploadArtworkIcon,
    title: "Upload Artwork",
    description: "Start with inspiration",
  },
  {
    id: "synthesis",
    icon: AISynthesisIcon,
    title: "AI Synthesis",
    description: "Refine the concept",
  },
  {
    id: "review",
    icon: FinalReviewIcon,
    title: "Final Review",
    description: "Check every detail",
  },
  {
    id: "fabric",
    icon: FabricStyleIcon,
    title: "Fabric Style",
    description: "Select the material",
  },
  {
    id: "sizing",
    icon: SizingFitIcon,
    title: "Sizing & Fit",
    description: "Perfect for you",
  },
];
