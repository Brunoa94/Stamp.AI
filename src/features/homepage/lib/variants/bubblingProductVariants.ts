import { cva } from "class-variance-authority";

/** Floating product tile in the hero; sizes scale up with the viewport. */
export const bubblingProductVariants = cva(
  "bubbling-product absolute pointer-events-none",
  {
    variants: {
      size: {
        sm: "w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40",
        md: "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52",
        lg: "w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64",
      },
    },
  },
);
