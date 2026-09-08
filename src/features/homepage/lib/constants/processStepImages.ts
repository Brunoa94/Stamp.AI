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
    src: "/stamp-steps/upload.png",
    alt: "Upload your own photo or sketch as a starting point",
  },
  "step-describe": {
    src: "/stamp-steps/describe.png",
    alt: "Describe your idea in simple words",
  },
  "step-results": {
    src: "/stamp-steps/result.png",
    alt: "Pick your favorite design from the results",
  },
  "step-product": {
    src: "/stamp-steps/product.png",
    alt: "Pick a product to print on - tees, hoodies, mugs and more",
  },
  "step-customize": {
    src: "/stamp-steps/customize.png",
    alt: "Choose size and color, and place your design",
  },
  "step-create": {
    src: "/stamp-steps/preview.png",
    alt: "Preview your design and add it to the bag",
  },
};
