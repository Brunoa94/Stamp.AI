import { cva } from "class-variance-authority";

/** Art backdrop behind each product in the flow demo's product grid. */
export const flowProductBackdropVariants = cva(
  "flex h-24 items-center justify-center sm:h-30",
  {
    variants: {
      backdrop: {
        sage: "bg-(--color-flow-art-backdrop-sage)",
        sand: "bg-(--color-flow-art-backdrop-sand)",
      },
    },
  },
);
