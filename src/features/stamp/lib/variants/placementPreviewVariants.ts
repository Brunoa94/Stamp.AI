import { cva } from "class-variance-authority";

/** Product frame in PlacementPreview; aspect follows the product orientation. */
export const placementPreviewVariants = cva("relative mx-auto w-full max-w-sm", {
  variants: {
    orientation: {
      vertical: "aspect-5/6",
      horizontal: "aspect-6/5",
      square: "aspect-square",
    },
  },
  defaultVariants: { orientation: "vertical" },
});
