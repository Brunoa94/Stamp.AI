/**
 * ProductSilhouette
 *
 * Minimal SVG outline of the product used as the backdrop
 * of the CSS placement preview. Purely decorative.
 */

export type OrientationType = "vertical" | "horizontal" | "square";

interface PropsI {
  category: "apparel" | "tote" | "mug" | "poster" | "pillow" | "canvas" | "socks";
  /** For canvas/poster: controls the aspect ratio of the frame */
  orientation?: OrientationType;
}

export function ProductSilhouette({ category, orientation = "vertical" }: PropsI) {
  if (category === "tote") {
    return (
      <svg
        viewBox="0 0 100 120"
        className="h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Handles */}
        <path
          d="M30 25 C30 8, 70 8, 70 25"
          fill="none"
          stroke="var(--color-stamp-divider)"
          strokeWidth="2.5"
        />
        {/* Bag body */}
        <rect
          x="15"
          y="25"
          width="70"
          height="85"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (category === "mug") {
    return (
      <svg
        viewBox="0 0 100 120"
        className="h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Mug body */}
        <path
          d="M20 25 L20 95 Q20 105, 30 105 L60 105 Q70 105, 70 95 L70 25 Z"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
        />
        {/* Handle */}
        <path
          d="M70 40 Q90 40, 90 60 Q90 80, 70 80"
          fill="none"
          stroke="var(--color-stamp-divider)"
          strokeWidth="2.5"
        />
        {/* Rim */}
        <ellipse
          cx="45"
          cy="25"
          rx="25"
          ry="6"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (category === "canvas" || category === "poster") {
    // Adjust dimensions based on orientation
    if (orientation === "horizontal") {
      return (
        <svg
          viewBox="0 0 120 100"
          className="h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Canvas/poster frame - horizontal */}
          <rect
            x="10"
            y="10"
            width="100"
            height="80"
            fill="var(--color-stamp-cream)"
            stroke="var(--color-stamp-divider)"
            strokeWidth="1.5"
          />
          {/* Inner frame border */}
          <rect
            x="14"
            y="14"
            width="92"
            height="72"
            fill="none"
            stroke="var(--color-stamp-divider)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
      );
    }

    if (orientation === "square") {
      return (
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Canvas/poster frame - square */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            fill="var(--color-stamp-cream)"
            stroke="var(--color-stamp-divider)"
            strokeWidth="1.5"
          />
          {/* Inner frame border */}
          <rect
            x="14"
            y="14"
            width="72"
            height="72"
            fill="none"
            stroke="var(--color-stamp-divider)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
      );
    }

    // Default: vertical
    return (
      <svg
        viewBox="0 0 100 120"
        className="h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Canvas/poster frame - vertical */}
        <rect
          x="10"
          y="15"
          width="80"
          height="90"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
        />
        {/* Inner frame border */}
        <rect
          x="14"
          y="19"
          width="72"
          height="82"
          fill="none"
          stroke="var(--color-stamp-divider)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  if (category === "socks") {
    return (
      <svg
        viewBox="0 0 100 120"
        className="h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Left sock */}
        <path
          d="M20 10 L20 70 Q20 85, 30 90 L45 95 Q55 95, 55 85 L55 80 Q55 70, 45 65 L35 60 L35 10 Z"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Right sock */}
        <path
          d="M65 10 L65 70 Q65 85, 75 90 L90 95 Q100 95, 100 85 L100 80 Q100 70, 90 65 L80 60 L80 10 Z"
          fill="var(--color-stamp-cream)"
          stroke="var(--color-stamp-divider)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          transform="translate(-15, 0)"
        />
        {/* Cuff lines */}
        <line x1="20" y1="20" x2="35" y2="20" stroke="var(--color-stamp-divider)" strokeWidth="0.75" />
        <line x1="50" y1="20" x2="65" y2="20" stroke="var(--color-stamp-divider)" strokeWidth="0.75" />
      </svg>
    );
  }

  // Default: apparel (t-shirt / hoodie / sweatshirt)
  return (
    <svg
      viewBox="0 0 100 120"
      className="h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M35 10 L20 18 L4 34 L14 46 L22 40 L22 112 L78 112 L78 40 L86 46 L96 34 L80 18 L65 10 C62 16, 55 19, 50 19 C45 19, 38 16, 35 10 Z"
        fill="var(--color-stamp-cream)"
        stroke="var(--color-stamp-divider)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Collar */}
      <path
        d="M35 10 C38 16, 45 19, 50 19 C55 19, 62 16, 65 10"
        fill="none"
        stroke="var(--color-stamp-divider)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
