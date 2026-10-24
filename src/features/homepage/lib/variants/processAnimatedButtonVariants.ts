import { cva } from "class-variance-authority";

/** CTA that builds block by block; clickable only once complete. */
export const processAnimatedButtonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md h-auto px-12 py-6 md:px-16 md:py-7 bg-(--color-stamp-chocolate) shadow-md transition-all duration-300",
  {
    variants: {
      complete: {
        true: "cursor-pointer hover:shadow-lg active:scale-[0.98]",
        false: "cursor-not-allowed opacity-70",
      },
    },
  },
);
