import { cva } from "class-variance-authority";

/** Full-window background of FlowGeneratingStep. */
export const flowGeneratingRootVariants = cva(
  "animate-flow-fade absolute inset-0 flex flex-col items-center justify-center gap-4.5 px-6 text-center",
  {
    variants: {
      tone: {
        dark: "bg-(--color-stamp-chocolate)",
        light: "bg-(--color-stamp-cream)",
      },
    },
  },
);

export const flowGeneratingTitleVariants = cva("text-2xl uppercase tracking-wide", {
  variants: {
    tone: {
      dark: "text-(--color-stamp-cream)",
      light: "text-(--color-stamp-chocolate)",
    },
  },
});

export const flowGeneratingEtaVariants = cva("text-2xs uppercase tracking-widest", {
  variants: {
    tone: {
      dark: "text-(--color-stamp-cream)/60",
      light: "text-(--color-stamp-taupe)",
    },
  },
});

/** Color for the step icon and the spinner's background ring. */
export const flowGeneratingIconVariants = cva("", {
  variants: {
    tone: {
      dark: "text-(--color-stamp-cream)/80",
      light: "text-(--color-stamp-taupe)",
    },
  },
});

export const flowGeneratingTrackVariants = cva("h-0.5 w-50", {
  variants: {
    tone: {
      dark: "bg-(--color-stamp-cream)/15",
      light: "bg-(--color-stamp-chocolate)/10",
    },
  },
});
