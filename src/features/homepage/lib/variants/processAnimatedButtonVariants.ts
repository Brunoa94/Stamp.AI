import { cva } from "class-variance-authority";

/** CTA that builds block by block; clickable only once complete, then lifts like the stamp buttons. */
export const processAnimatedButtonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg h-auto px-12 py-6 md:px-16 md:py-7 bg-(--color-stamp-chocolate) transition-all duration-300",
  {
    variants: {
      complete: {
        true: "cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
        false: "cursor-not-allowed opacity-70",
      },
    },
  },
);
