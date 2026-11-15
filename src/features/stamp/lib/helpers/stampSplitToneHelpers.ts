import type { CSSProperties } from "react";
import { STAMP_BACKDROP_EDGE } from "../constants/stampBackdrops";
import type { StampSplitToneT } from "../types/stampTypes";

type RectT = { left: number; top: number; width: number; height: number };
type ViewportT = { width: number; height: number };

/** Viewport x of the backdrop's diagonal edge at viewport y. */
function edgeX(y: number, viewport: ViewportT): number {
  const { topX, bottomX, canvasTopPx } = STAMP_BACKDROP_EDGE;
  const progress = (y - canvasTopPx) / (viewport.height - canvasTopPx);
  return viewport.width * (topX - (topX - bottomX) * progress);
}

/**
 * How a text element (its viewport rect) sits against the backdrop's diagonal
 * edge: entirely on the off-white (`base`), entirely on the photo (`photo`),
 * or crossed by the edge (`split`), with the CSS gradient angle and the stop
 * that lands on the edge inside the element's box.
 */
export function getStampSplitTone(rect: RectT, viewport: ViewportT): StampSplitToneT {
  if (viewport.width < STAMP_BACKDROP_EDGE.minViewportWidthPx) return { kind: "base" };

  // Edge in the element's own coordinates, at its top and bottom
  const xTop = edgeX(rect.top, viewport) - rect.left;
  const xBottom = edgeX(rect.top + rect.height, viewport) - rect.left;
  if (Math.min(xTop, xBottom) >= rect.width) return { kind: "base" };
  if (Math.max(xTop, xBottom) <= 0) return { kind: "photo" };

  // CSS gradient direction (0deg = up, clockwise) perpendicular to the edge, pointing at the photo
  const dx = xBottom - xTop;
  const angle = dx === 0 && rect.height === 0 ? Math.PI / 2 : Math.atan2(rect.height, dx);
  const dir = { x: Math.sin(angle), y: -Math.cos(angle) };

  // The gradient line runs through the box centre; project the edge's top point onto it
  const length = Math.abs(rect.width * dir.x) + Math.abs(rect.height * dir.y);
  const along = ((xTop - rect.width / 2) * dir.x + (0 - rect.height / 2) * dir.y) / length;

  return { kind: "split", angleDeg: (angle * 180) / Math.PI, stopPct: (0.5 + along) * 100 };
}

/**
 * Inline style that colours an element's text for its split tone. On the
 * off-white (`base`) it adds nothing, so the element's own colour class
 * applies (it can change per breakpoint); `colors.base` is that class's md+
 * colour, used for the off-white side of a split.
 */
export function getStampSplitToneStyle(
  tone: StampSplitToneT,
  colors: { base: string; photo: string },
): CSSProperties {
  if (tone.kind === "base") return {};
  if (tone.kind === "photo") return { color: colors.photo };

  const stop = `${tone.stopPct}%`;
  return {
    color: "transparent",
    backgroundImage: `linear-gradient(${tone.angleDeg}deg, ${colors.base} ${stop}, ${colors.photo} ${stop})`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
  };
}
