/**
 * Product Silhouette SVG Configuration
 *
 * Contains SVG path data and viewBox settings for each product category.
 * Separated from the component for maintainability.
 */

export type CategoryType = "apparel" | "tote" | "mug" | "poster" | "pillow" | "canvas" | "socks";
export type OrientationType = "vertical" | "horizontal" | "square";

interface SvgPathConfig {
  d: string;
  fill?: boolean;
  strokeWidth?: number;
  strokeLinejoin?: "round" | "miter" | "bevel";
  transform?: string;
}

interface SvgRectConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}

interface SvgEllipseConfig {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: boolean;
  strokeWidth?: number;
}

interface SvgLineConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
}

export interface SilhouetteConfig {
  viewBox: string;
  paths?: SvgPathConfig[];
  rects?: SvgRectConfig[];
  ellipses?: SvgEllipseConfig[];
  lines?: SvgLineConfig[];
}

export const SILHOUETTE_CONFIGS: Record<string, SilhouetteConfig> = {
  apparel: {
    viewBox: "0 0 100 120",
    paths: [
      {
        d: "M35 10 L20 18 L4 34 L14 46 L22 40 L22 112 L78 112 L78 40 L86 46 L96 34 L80 18 L65 10 C62 16, 55 19, 50 19 C45 19, 38 16, 35 10 Z",
        fill: true,
        strokeWidth: 1.5,
        strokeLinejoin: "round",
      },
      {
        d: "M35 10 C38 16, 45 19, 50 19 C55 19, 62 16, 65 10",
        fill: false,
        strokeWidth: 1.5,
      },
    ],
  },
  tote: {
    viewBox: "0 0 100 120",
    paths: [
      {
        d: "M30 25 C30 8, 70 8, 70 25",
        fill: false,
        strokeWidth: 2.5,
      },
    ],
    rects: [
      {
        x: 15,
        y: 25,
        width: 70,
        height: 85,
        fill: true,
        strokeWidth: 1.5,
      },
    ],
  },
  mug: {
    viewBox: "0 0 100 120",
    paths: [
      {
        d: "M20 25 L20 95 Q20 105, 30 105 L60 105 Q70 105, 70 95 L70 25 Z",
        fill: true,
        strokeWidth: 1.5,
      },
      {
        d: "M70 40 Q90 40, 90 60 Q90 80, 70 80",
        fill: false,
        strokeWidth: 2.5,
      },
    ],
    ellipses: [
      {
        cx: 45,
        cy: 25,
        rx: 25,
        ry: 6,
        fill: true,
        strokeWidth: 1.5,
      },
    ],
  },
  "canvas-vertical": {
    viewBox: "0 0 100 120",
    rects: [
      {
        x: 10,
        y: 15,
        width: 80,
        height: 90,
        fill: true,
        strokeWidth: 1.5,
      },
      {
        x: 14,
        y: 19,
        width: 72,
        height: 82,
        fill: false,
        strokeWidth: 0.5,
        strokeDasharray: "2,2",
      },
    ],
  },
  "canvas-horizontal": {
    viewBox: "0 0 120 100",
    rects: [
      {
        x: 10,
        y: 10,
        width: 100,
        height: 80,
        fill: true,
        strokeWidth: 1.5,
      },
      {
        x: 14,
        y: 14,
        width: 92,
        height: 72,
        fill: false,
        strokeWidth: 0.5,
        strokeDasharray: "2,2",
      },
    ],
  },
  "canvas-square": {
    viewBox: "0 0 100 100",
    rects: [
      {
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        fill: true,
        strokeWidth: 1.5,
      },
      {
        x: 14,
        y: 14,
        width: 72,
        height: 72,
        fill: false,
        strokeWidth: 0.5,
        strokeDasharray: "2,2",
      },
    ],
  },
  socks: {
    viewBox: "0 0 100 120",
    paths: [
      {
        d: "M20 10 L20 70 Q20 85, 30 90 L45 95 Q55 95, 55 85 L55 80 Q55 70, 45 65 L35 60 L35 10 Z",
        fill: true,
        strokeWidth: 1.5,
        strokeLinejoin: "round",
      },
      {
        d: "M65 10 L65 70 Q65 85, 75 90 L90 95 Q100 95, 100 85 L100 80 Q100 70, 90 65 L80 60 L80 10 Z",
        fill: true,
        strokeWidth: 1.5,
        strokeLinejoin: "round",
        transform: "translate(-15, 0)",
      },
    ],
    lines: [
      { x1: 20, y1: 20, x2: 35, y2: 20, strokeWidth: 0.75 },
      { x1: 50, y1: 20, x2: 65, y2: 20, strokeWidth: 0.75 },
    ],
  },
  pillow: {
    viewBox: "0 0 100 100",
    paths: [
      {
        // Square pillow with rounded corners and puffy edges
        d: "M15 15 Q10 15, 10 20 L10 80 Q10 85, 15 85 L85 85 Q90 85, 90 80 L90 20 Q90 15, 85 15 Z",
        fill: true,
        strokeWidth: 1.5,
        strokeLinejoin: "round",
      },
      {
        // Top puffy edge curve
        d: "M15 15 Q50 8, 85 15",
        fill: false,
        strokeWidth: 1,
      },
      {
        // Bottom puffy edge curve
        d: "M15 85 Q50 92, 85 85",
        fill: false,
        strokeWidth: 1,
      },
      {
        // Left puffy edge curve
        d: "M10 20 Q4 50, 10 80",
        fill: false,
        strokeWidth: 1,
      },
      {
        // Right puffy edge curve
        d: "M90 20 Q96 50, 90 80",
        fill: false,
        strokeWidth: 1,
      },
    ],
  },
};

/**
 * Get the silhouette config key based on category and orientation
 */
export function getSilhouetteKey(
  category: CategoryType,
  orientation?: OrientationType
): string {
  if (category === "canvas" || category === "poster") {
    return `canvas-${orientation || "vertical"}`;
  }
  return category;
}
