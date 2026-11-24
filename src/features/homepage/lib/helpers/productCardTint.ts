import type { HomeProductCardTintT } from "../types/productCardTint";

const CARD_TINTS: HomeProductCardTintT[] = ["mint", "sand", "lavender", "rose"];

/** The tint for the card at `index`, so neighbouring cards never match */
export function productCardTint(index: number): HomeProductCardTintT {
  return CARD_TINTS[index % CARD_TINTS.length];
}
