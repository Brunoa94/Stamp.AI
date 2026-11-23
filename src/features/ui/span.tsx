import { cn } from "@/lib/utils";

/**
 * Span
 *
 * Typography atom for small label/meta text. Running UI text (sm, default,
 * micro, value) is sentence case; eyebrow-style labels (label, meta, badge,
 * pill) keep the brand's uppercase with moderate tracking.
 * Encapsulates: font-family, font-size, font-weight, letter-spacing, text-transform.
 * All other styling (color, margin, opacity) must come from the caller via `className`.
 *
 * Variants:
 * - sm         Column headings, card labels — base, semibold
 * - default    Platform labels, breakdown headers, UI meta text — sm, semibold
 * - micro      Testimonial badges, scroll indicator, sub-titles — xs, medium
 * - label      Eyebrows above section titles, footer column headings — xs, uppercase, tracking-widest
 * - meta       Order meta, timestamps — xs→sm, uppercase, tracking-wider
 * - badge      Status badges — xs, uppercase, tracking-wider
 * - value      Data values — sm→base, semibold
 * - metric     Large metric display — 6xl-7xl, Anton font
 * - serif      Serif-italic accent word inside headings — inherits size from parent
 * - script     Upright handwritten accent word inside headings — inherits size from parent
 * - band       Marquee band labels — 3xl→4xl, heading font, off-white (sits on chocolate)
 * - bandAccent Alternating marquee band labels — as band, in gold
 * - giant      Oversized numerals (404 page) — 8xl→240px, heading font
 * - caption    Option descriptions — xs, inherits font
 * - price      Inline prices in option cards — sm, medium weight, inherits font
 * - pill       Floating "popular" badges — xs, uppercase, tracking-wider
 * - strong     Emphasised inline label — heading font, bold, inherits size
 * - credits    Credit amount in package cards — 2xl, heading font, bold
 * - total      Order/summary total — xl, heading font, bold
 */

const spanVariants = {
  sm: "font-body text-base font-semibold",
  default: "font-body text-sm font-semibold",
  micro: "font-body text-xs font-medium",
  label: "font-body text-xs font-bold uppercase tracking-widest",
  meta: "font-body text-xs md:text-sm font-semibold uppercase tracking-wider",
  badge: "font-body text-xs font-bold uppercase tracking-wider",
  value: "font-body text-sm md:text-base font-semibold",
  metric:
    "font-(family-name:--font-bebas-neue) text-7xl md:text-8xl uppercase tracking-tighter",
  serif: "font-serif italic lowercase font-light",
  script: "font-serif font-normal",
  caption: "text-xs",
  price: "text-sm font-medium",
  pill: "text-xs font-bold uppercase tracking-wider",
  strong: "font-heading font-bold",
  credits: "font-heading text-2xl font-bold",
  total: "font-heading text-xl font-bold",
  band: "font-heading text-3xl md:text-4xl font-normal tracking-tight leading-none text-(--color-stamp-off-white)",
  bandAccent:
    "font-heading text-3xl md:text-4xl font-normal tracking-tight leading-none text-(--color-stamp-gold)",
  giant:
    "font-heading text-8xl sm:text-[180px] md:text-[240px] font-semibold uppercase tracking-wide leading-none",
} as const;

type SpanVariant = keyof typeof spanVariants;
type SpanTag = "span" | "p" | "div" | "footer" | "h6";

interface SpanProps extends React.HTMLAttributes<HTMLElement> {
  as?: SpanTag;
  variant?: SpanVariant;
  unstyled?: boolean;
}

export function Span({
  as: Tag = "span",
  variant = "default",
  unstyled = false,
  className,
  children,
  ...props
}: SpanProps) {
  return (
    <Tag
      className={cn(!unstyled && spanVariants[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
