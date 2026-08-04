/**
 * ProductSilhouette
 *
 * Minimal SVG outline of the product (apparel or tote) used as the backdrop
 * of the CSS placement preview. Purely decorative.
 */

interface PropsI {
  category: "apparel" | "tote" | "mug" | "poster" | "pillow" | "canvas";
}

export function ProductSilhouette({ category }: PropsI) {
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
