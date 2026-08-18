/**
 * Process step images
 *
 * Maps process step IDs to their corresponding images.
 * Images are reused from existing assets in the /home and /suggested-edits folders.
 */

export type ProcessStepImageType = {
  src: string;
  alt: string;
};

export const PROCESS_STEP_IMAGES: Record<string, ProcessStepImageType> = {
  "step-upload": {
    src: "/suggested-edits/golden-hour.png",
    alt: "Upload your own photo or sketch as a starting point",
  },
  "step-describe": {
    src: "/suggested-edits/sketch.png",
    alt: "Describe your idea in simple words",
  },
  "step-generate": {
    src: "/suggested-edits/line-art.png",
    alt: "The AI draws your design in seconds",
  },
  "step-results": {
    src: "/suggested-edits/vibrant.png",
    alt: "Pick your favorite design from the results",
  },
  "step-product": {
    src: "/home/3-a.png",
    alt: "Pick a product to print on - tees, hoodies, mugs and more",
  },
  "step-customize": {
    src: "/home/5-a.png",
    alt: "Choose size and color, and place your design",
  },
  "step-create": {
    src: "/home/6-a.png",
    alt: "Preview your design on the real product",
  },
  "step-checkout": {
    src: "/home/4-a.png",
    alt: "Check out and we print and ship it to your door",
  },
};
