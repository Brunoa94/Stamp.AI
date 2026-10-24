import { cva } from "class-variance-authority";

/** Accent bar along the top of PaymentResultCard. */
export const paymentResultBarVariants = cva("absolute top-0 left-0 w-full h-1", {
  variants: {
    tone: {
      success: "bg-(--color-stamp-success)",
      error: "bg-(--color-stamp-error)",
      pending: "bg-(--color-stamp-gold)",
    },
  },
});

/** Round status icon badge in PaymentResultCard. */
export const paymentResultIconVariants = cva(
  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10",
  {
    variants: {
      tone: {
        success: "bg-(--color-stamp-success)/10 text-(--color-stamp-success)",
        error: "bg-(--color-stamp-error)/10 text-(--color-stamp-error)",
        pending: "bg-(--color-stamp-gold)/10 text-(--color-stamp-gold-text)",
      },
    },
  },
);

/** Status dot in PaymentResultDetailsGrid; in-flight states pulse. */
export const paymentResultStatusDotVariants = cva("w-2 h-2 rounded-full", {
  variants: {
    tone: {
      success: "bg-(--color-stamp-success) animate-pulse",
      error: "bg-(--color-stamp-error)",
      pending: "bg-(--color-stamp-gold) animate-pulse",
    },
  },
});

/** Status value text in PaymentResultDetailsGrid. */
export const paymentResultStatusTextVariants = cva(
  "font-heading text-lg uppercase tracking-wide font-bold",
  {
    variants: {
      tone: {
        success: "text-(--color-stamp-success)",
        error: "text-(--color-stamp-error)",
        pending: "text-(--color-stamp-gold-text)",
      },
    },
  },
);
