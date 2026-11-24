import { CUSTOMIZED_SHOTS_BY_BLUEPRINT } from "@/features/homepage/lib/constants/productOfMonthShowcase";
import type { ProductOfMonthShotT } from "@/features/homepage/lib/types/productOfMonth";

/** The customized photos to crossfade after the blank one; empty when the product has none */
export function getCustomizedShots(blueprintId: number): readonly ProductOfMonthShotT[] {
  return CUSTOMIZED_SHOTS_BY_BLUEPRINT[blueprintId] ?? [];
}
