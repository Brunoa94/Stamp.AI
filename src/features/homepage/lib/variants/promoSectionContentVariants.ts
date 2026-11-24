import { cva } from "class-variance-authority";

/** Column of promo copy: centered when stacked, aligned left, center or right beside the carousel. */
export const promoSectionContentVariants = cva("flex flex-col items-center gap-3 text-center", {
  variants: {
    align: {
      left: "lg:items-start lg:text-left",
      center: "",
      right: "lg:items-end lg:text-right",
    },
  },
  defaultVariants: { align: "center" },
});
