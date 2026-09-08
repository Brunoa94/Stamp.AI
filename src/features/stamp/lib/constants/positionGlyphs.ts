/**
 * Position Glyph Constants
 *
 * SVG path data for print position icons: tee front/back views,
 * sleeve highlights, collar, and sock for sock legs.
 */

const TEE_BODY =
  "M8 3 L4.5 5 L1.5 8.5 L4.5 11.5 L6.5 9.8 L6.5 20 L17.5 20 L17.5 9.8 L19.5 11.5 L22.5 8.5 L19.5 5 L16 3";

const SOCK_BODY =
  "M8 3 L8 13 Q8 16, 10.5 17.2 L15 19.2 Q17.5 19.6, 17.8 17.2 Q18 15, 15.5 13.8 L12.5 12.5 L12.5 3 Z";

export interface GlyphPartsI {
  paths: string[];
  rects?: { x: number; y: number; width: number; height: number }[];
}

export const POSITION_GLYPHS: Record<string, GlyphPartsI> = {
  front: {
    // Deep front collar curve
    paths: [TEE_BODY, "M8 3 C9 6.5, 10.5 7.5, 12 7.5 C13.5 7.5, 15 6.5, 16 3"],
  },
  back: {
    // Shallow back collar + label tag below it
    paths: [TEE_BODY, "M8 3 C9 4.6, 10.5 5, 12 5 C13.5 5, 15 4.6, 16 3"],
    rects: [{ x: 10.5, y: 6.2, width: 3, height: 2.2 }],
  },
  neck: {
    paths: [TEE_BODY, "M8 3 C9 4.6, 10.5 5, 12 5 C13.5 5, 15 4.6, 16 3"],
    rects: [{ x: 10, y: 6.2, width: 4, height: 3 }],
  },
  left_sleeve: {
    paths: [TEE_BODY, "M8 3 C9 6.5, 10.5 7.5, 12 7.5 C13.5 7.5, 15 6.5, 16 3"],
    rects: [{ x: 2.5, y: 6.5, width: 3, height: 3 }],
  },
  right_sleeve: {
    paths: [TEE_BODY, "M8 3 C9 6.5, 10.5 7.5, 12 7.5 C13.5 7.5, 15 6.5, 16 3"],
    rects: [{ x: 18.5, y: 6.5, width: 3, height: 3 }],
  },
  left_leg: { paths: [SOCK_BODY] },
  right_leg: { paths: [SOCK_BODY] },
};
