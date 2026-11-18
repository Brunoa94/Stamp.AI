import { cva } from "class-variance-authority";

/**
 * One word in the hero's rotating headline; words share a grid cell. Only
 * transform and opacity change, so the swap stays on the compositor.
 */
export const heroRotatingWordVariants = cva(
  "col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-500 ease-snap",
  {
    variants: {
      state: {
        active: "translate-y-0 opacity-100",
        leaving: "-translate-y-1/2 opacity-0",
        waiting: "translate-y-1/2 opacity-0",
      },
    },
  },
);
