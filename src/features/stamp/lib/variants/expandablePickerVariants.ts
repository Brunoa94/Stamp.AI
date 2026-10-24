import { cva } from "class-variance-authority";

/** Item grid inside ExpandablePicker. */
export const expandablePickerGridVariants = cva("grid", {
  variants: {
    columns: {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    },
    gap: {
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
    },
  },
  defaultVariants: { columns: 2, gap: 3 },
});
