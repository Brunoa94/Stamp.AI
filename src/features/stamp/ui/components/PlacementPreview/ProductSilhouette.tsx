/**
 * ProductSilhouette
 *
 * Minimal SVG outline of the product used as the backdrop
 * of the CSS placement preview. Purely decorative.
 *
 * SVG path data is externalized to silhouetteConfig.ts for maintainability.
 */

import {
  SILHOUETTE_CONFIGS,
  getSilhouetteKey,
  type CategoryType,
  type OrientationType,
} from "../../../lib/config/silhouetteConfig";

export type { CategoryType, OrientationType };

interface PropsI {
  category: CategoryType;
  /** For canvas/poster: controls the aspect ratio of the frame */
  orientation?: OrientationType;
}

export function ProductSilhouette({ category, orientation = "vertical" }: PropsI) {
  const configKey = getSilhouetteKey(category, orientation);
  const config = SILHOUETTE_CONFIGS[configKey] || SILHOUETTE_CONFIGS.apparel;

  return (
    <svg
      viewBox={config.viewBox}
      className="h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {config.paths?.map((path, index) => (
        <path
          key={`path-${index}`}
          d={path.d}
          fill={path.fill ? "var(--color-stamp-cream)" : "none"}
          stroke="var(--color-stamp-divider)"
          strokeWidth={path.strokeWidth}
          strokeLinejoin={path.strokeLinejoin}
          transform={path.transform}
        />
      ))}
      {config.rects?.map((rect, index) => (
        <rect
          key={`rect-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={rect.fill ? "var(--color-stamp-cream)" : "none"}
          stroke="var(--color-stamp-divider)"
          strokeWidth={rect.strokeWidth}
          strokeDasharray={rect.strokeDasharray}
        />
      ))}
      {config.ellipses?.map((ellipse, index) => (
        <ellipse
          key={`ellipse-${index}`}
          cx={ellipse.cx}
          cy={ellipse.cy}
          rx={ellipse.rx}
          ry={ellipse.ry}
          fill={ellipse.fill ? "var(--color-stamp-cream)" : "none"}
          stroke="var(--color-stamp-divider)"
          strokeWidth={ellipse.strokeWidth}
        />
      ))}
      {config.lines?.map((line, index) => (
        <line
          key={`line-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="var(--color-stamp-divider)"
          strokeWidth={line.strokeWidth}
        />
      ))}
    </svg>
  );
}
