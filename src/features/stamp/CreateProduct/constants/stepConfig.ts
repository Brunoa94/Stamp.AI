/**
 * Step configuration for the wizard workflow
 * Maps internal workflow steps to display configuration
 */

import type { WizardStepT, StepConfig } from "@/types/wizard";

export const STEP_CONFIG: Record<WizardStepT, StepConfig> = {
  upload: {
    number: "Step 01",
    title: "Upload Your Artwork",
    description:
      "Drag and drop your design or inspiration image to get started.",
    dotIndex: 0,
  },
  form: {
    number: "Step 01",
    title: "Upload Your Artwork",
    description:
      "Drag and drop your design or inspiration image to get started.",
    dotIndex: 0,
  },
  synthesis: {
    number: "Step 02",
    title: "AI Synthesis",
    description:
      "Describe your design idea and let our AI engine synthesize unique variations for your custom tee.",
    dotIndex: 1,
  },
  generating: {
    number: "Step 02",
    title: "AI Synthesis",
    description:
      "Our AI is analyzing your image and generating unique designs.",
    dotIndex: 1,
  },
  review: {
    number: "Step 03",
    title: "Final Inspection",
    description: "Review your final design before proceeding to checkout.",
    dotIndex: 2,
  },
  results: {
    number: "Step 03",
    title: "Final Inspection",
    description: "Review your final design before proceeding to checkout.",
    dotIndex: 2,
  },
  fabric: {
    number: "Step 04",
    title: "Choose Your Canvas",
    description:
      "Finalize the feel and fit. Choose from our sustainable premium fabrics.",
    dotIndex: 3,
  },
  customizing: {
    number: "Step 04",
    title: "Choose Your Canvas",
    description:
      "Finalize the feel and fit. Choose from our sustainable premium fabrics.",
    dotIndex: 3,
  },
  creating: {
    number: "Step 04",
    title: "Creating Your Product",
    description:
      "Please wait while we prepare your custom tee with your unique design.",
    dotIndex: 3,
  },
  sizing: {
    number: "Step 05",
    title: "Ready to Cart",
    description:
      "Your custom tee is ready! Review your design and add it to your cart.",
    dotIndex: 4,
  },
  created: {
    number: "Step 05",
    title: "Ready to Cart",
    description:
      "Your custom tee is ready! Review your design and add it to your cart.",
    dotIndex: 4,
  },
} as const;

export const TOTAL_STEPS = 5;
