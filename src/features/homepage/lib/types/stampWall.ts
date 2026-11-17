/**
 * One postage stamp on the hero's product wall. With `flipSrc` the stamp turns
 * over from the customer's original photo or logo (`src`) to the printed product.
 */
export type StampWallTileT = {
  id: string;
  src: string;
  flipSrc?: string;
};

/** One drifting column of the wall: its stamps, how fast it loops and which way */
export type StampWallColumnT = {
  id: string;
  tiles: StampWallTileT[];
  durationS: number;
  isReversed: boolean;
};
