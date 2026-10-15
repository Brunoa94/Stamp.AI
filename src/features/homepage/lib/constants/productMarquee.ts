/** Product ranges scrolling in the marquee band; labels live in home.productMarquee.items */
export const PRODUCT_MARQUEE_ITEM_IDS = [
  "fleeceHoodies",
  "ceramicMugs",
  "accessories",
  "kidsTees",
  "softstyleTees",
] as const;

/** Copies of the list per marquee half, so one half is always wider than the viewport */
export const PRODUCT_MARQUEE_REPEATS = 2;

/** Seconds for one full loop; larger is slower */
export const PRODUCT_MARQUEE_DURATION_S = 40;
