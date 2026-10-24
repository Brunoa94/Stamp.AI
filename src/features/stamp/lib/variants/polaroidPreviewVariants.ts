import { cva } from "class-variance-authority";

export const polaroidContainerVariants = cva(
  "block w-full bg-white shadow-xl relative rotate-1 group hover:rotate-0 transition-all duration-500 cursor-zoom-in focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        sm: "max-w-xs p-4",
        md: "max-w-md p-6",
        lg: "max-w-lg p-8",
      },
    },
  },
);

export const polaroidImageVariants = cva(
  "aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden relative",
  {
    variants: {
      size: {
        sm: "mb-4",
        md: "mb-6",
        lg: "mb-8",
      },
    },
  },
);

export const polaroidSpinnerVariants = cva("animate-spin text-(--color-stamp-taupe)/40", {
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
      sm: "top-6 left-6 px-2 py-0.5 text-[7px]",
      md: "top-10 left-10 px-3 py-1 text-[8px]",
      lg: "top-12 left-12 px-4 py-1.5 text-[9px]",
    },
  },
});
