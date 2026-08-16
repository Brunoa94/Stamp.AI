/**
 * PositionGlyph
 *
 * Tiny decorative icon distinguishing print positions on the position
 * cards: a tee seen from the front (deep collar), from the back (shallow
 * collar + label tag), collar/sleeve highlights and a sock for sock legs.
 */

import { POSITION_GLYPHS } from "@/features/stamp/lib/constants/positionGlyphs";

interface PropsI {
  position: string;
}

export function PositionGlyph({ position }: PropsI) {
  const glyph = POSITION_GLYPHS[position] ?? POSITION_GLYPHS.front;
  const mirrored = position === "right_leg";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinejoin="round"
    >
      <g transform={mirrored ? "translate(24, 0) scale(-1, 1)" : undefined}>
        {glyph.paths.map((d) => (
          <path key={d} d={d} />
        ))}
        {glyph.rects?.map((rect) => (
          <rect
            key={`${rect.x}-${rect.y}`}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="currentColor"
            stroke="none"
            opacity={0.55}
          />
        ))}
      </g>
    </svg>
  );
}
