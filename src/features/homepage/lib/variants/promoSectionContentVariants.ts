import { cva } from "class-variance-authority";

/** Column of promo copy, aligned left, center or right. */
export const promoSectionContentVariants = cva("flex flex-col gap-5", {
  variants: {
    align: {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end",
    },
  },
  defaultVariants: { align: "center" },
});
