import { cn } from "@/lib/utils";

/**
 * Heading
 *
 * Typography atom for Anton-based headings.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, effects) must come from the caller via `className`.
 *
 * Variants:
 * - display   Hero h1 — massive fluid viewport-relative title
 * - cta       CTA section h2 — slightly smaller fluid title
 * - section   Section header h2 — fixed responsive scale (6xl→9xl)
 * - title     Interior section h2 — fixed responsive scale (6xl→8xl)
 * - card      Card / step h3 — 2xl→3xl
 * - question  FAQ summary — xl→2xl
 * - item      Product name / testimonial author — lg→xl
 */

const headingVariants = {
  display:
    "font-anton text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase",
  cta: "font-anton text-[10vw] md:text-[8vw] lg:text-[6vw] leading-[0.9] tracking-tighter uppercase",
  section:
    "font-anton text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none uppercase",
  title:
    "font-anton text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-none uppercase",
  card: "font-anton text-2xl md:text-3xl tracking-tight leading-tight uppercase",
  question:
    "font-anton text-xl md:text-2xl tracking-tight leading-tight uppercase",
  item: "font-anton text-lg md:text-xl tracking-tight uppercase",
} as const;

export type HeadingVariant = keyof typeof headingVariants;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

interface HeadingProps {
  as?: HeadingTag;
  variant: HeadingVariant;
  className?: string;
  children: React.ReactNode;
}

export function Heading({
  as: Tag = "h2",
  variant,
  className,
  children,
}: HeadingProps) {
  return (
    <Tag className={cn(headingVariants[variant], className)}>{children}</Tag>
  );
}
