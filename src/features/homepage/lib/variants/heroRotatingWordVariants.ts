import { cva } from "class-variance-authority";

/** One word in the hero's rotating headline; words share a grid cell. */
export const heroRotatingWordVariants = cva(
  "col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-snap",
  {
    variants: {
      state: {
        active: "translate-y-0 opacity-100 blur-none",
        leaving: "-translate-y-1/2 opacity-0 blur-sm",
        waiting: "translate-y-1/2 opacity-0 blur-sm",
      },
    },
  },
);
