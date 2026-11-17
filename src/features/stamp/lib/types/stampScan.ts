/** One shop product on the entry scan: the blank catalog shot and the same shot printed */
export type StampScanSlideT = {
  id: string;
  blankSrc: string;
  printedSrc: string;
};

/** One drifting column of the entry scan: its products and how long one pass takes */
export type StampScanColumnT = {
  id: string;
  tiles: StampScanSlideT[];
  durationS: number;
};
