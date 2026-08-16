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
  "step-studio": {
    src: "/suggested-edits/golden-hour.png",
    alt: "AI design studio - upload your photo or describe your idea",
  },
  "step-synthesis": {
    src: "/suggested-edits/line-art.png",
    alt: "AI synthesis - transforming ideas into print-ready artwork",
  },
  "step-material": {
    src: "/home/3-a.png",
    alt: "Premium materials - heavyweight tees and quality blanks",
  },
  "step-production": {
    src: "/home/1-a.png",
    alt: "Print on demand production with eco-friendly inks",
  },
  "step-quality": {
    src: "/home/2-a.png",
    alt: "Quality control - every order checked by hand",
  },
  "step-delivery": {
    src: "/home/4-a.png",
    alt: "Carbon-neutral shipping with tracking",
  },
};
