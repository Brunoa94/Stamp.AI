import { cva } from "class-variance-authority";

/** Uppercase field label inside the flow demo's mock screens. */
export const flowLabelVariants = cva(
  "font-body font-bold uppercase tracking-widest text-(--color-stamp-chocolate)/80",
  {
    variants: {
      size: {
        sm: "text-3xs",
        md: "text-2xs",
      },
    },
    defaultVariants: { size: "md" },
  },
);
