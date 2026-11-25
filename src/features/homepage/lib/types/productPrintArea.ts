import type { ProductConfig } from "@/lib/printPlacement/types";

export type PrintCategoryT = ProductConfig["category"];

/** Where the print sits on a product photo, in % of the photo frame */
export type PrintAreaRectT = {
  left: number;
  top: number;
  width: number;
  height: number;
};
