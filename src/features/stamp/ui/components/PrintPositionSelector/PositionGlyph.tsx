/**
 * PositionGlyph
 *
 * Tiny decorative icon distinguishing print positions on the position
 * cards: a tee seen from the front (deep collar), from the back (shallow
 * collar + label tag), collar/sleeve highlights and a sock for sock legs.
 */

const TEE_BODY =
  "M8 3 L4.5 5 L1.5 8.5 L4.5 11.5 L6.5 9.8 L6.5 20 L17.5 20 L17.5 9.8 L19.5 11.5 L22.5 8.5 L19.5 5 L16 3";

const SOCK_BODY =
  "M8 3 L8 13 Q8 16, 10.5 17.2 L15 19.2 Q17.5 19.6, 17.8 17.2 Q18 15, 15.5 13.8 L12.5 12.5 L12.5 3 Z";

interface GlyphPartsI {
  paths: string[];
  rects?: { x: number; y: number; width: number; height: number }[];
}

const GLYPHS: Record<string, GlyphPartsI> = {
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

interface PropsI {
  position: string;
}

export function PositionGlyph({ position }: PropsI) {
  const glyph = GLYPHS[position] ?? GLYPHS.front;
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
