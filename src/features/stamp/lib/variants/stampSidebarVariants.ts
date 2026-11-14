import { cva } from "class-variance-authority";

/**
 * "8 Steps to Print" sidebar surfaces. On the hero step (00) the canvas
 * backdrop photo is hidden, so the sidebar keeps its off-white panel and dark
 * copy; from step 01 it's transparent over the photo with light copy. Colours
 * transition with the backdrop's fade.
 */
const SURFACE_TRANSITION = "transition-colors duration-1000 ease-in-out";

export const stampSidebarVariants = cva(
  `hidden lg:flex flex-col py-32 px-10 w-68 h-full fixed right-0 top-24 border-l z-40 ${SURFACE_TRANSITION}`,
  {
    variants: {
      onPhoto: {
        true: "border-(--color-stamp-off-white)/15",
        false: "bg-(--color-stamp-off-white) border-(--color-stamp-divider)",
      },
    },
  },
);

export const stampSidebarTextVariants = cva(SURFACE_TRANSITION, {
  variants: {
    onPhoto: {
      true: "text-(--color-stamp-off-white)",
      false: "text-(--color-stamp-chocolate)",
    },
  },
});

export const stampSidebarDotVariants = cva(
  "w-1.5 h-1.5 rounded-full transition-all duration-300",
  {
    variants: {
      state: {
        active:
          "bg-(--color-stamp-gold) shadow-[0_0_15px_var(--color-stamp-gold)]",
        completed: "",
        upcoming: "",
      },
      onPhoto: { true: "", false: "" },
    },
    compoundVariants: [
      {
        state: "completed",
        onPhoto: true,
        className: "bg-(--color-stamp-off-white)",
      },
      {
        state: "completed",
        onPhoto: false,
        className: "bg-(--color-stamp-chocolate)",
      },
      {
        state: "upcoming",
        onPhoto: true,
        className: "bg-(--color-stamp-off-white)/40",
      },
      {
        state: "upcoming",
        onPhoto: false,
        className: "bg-(--color-stamp-divider)",
      },
    ],
  },
);
