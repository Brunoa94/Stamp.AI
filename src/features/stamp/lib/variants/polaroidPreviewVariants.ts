import { cva } from "class-variance-authority";

/**
 * Mockup preview card (PolaroidPreview): a white rounded card with the photo
 * rounded inside, lifting into the offset stamp shadow on hover.
 */
export const polaroidContainerVariants = cva(
  "group relative block w-full cursor-zoom-in rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      size: {
        sm: "max-w-xs p-2",
        md: "max-w-md p-3",
        lg: "max-w-lg p-4",
      },
    },
  },
);

export const polaroidImageVariants = cva(
  "aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden relative rounded-lg",
);

export const polaroidSpinnerVariants = cva("animate-spin text-(--color-stamp-taupe)", {
  variants: {
    size: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10",
    },
  },
});

export const polaroidBadgeVariants = cva("absolute", {
  variants: {
    size: {
      sm: "top-4 left-4",
      md: "top-5 left-5",
      lg: "top-6 left-6",
    },
  },
});
