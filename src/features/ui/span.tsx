import { cn } from "@/lib/utils";

/**
 * Span
 *
 * Typography atom for small uppercase Space Grotesk label/meta text.
 * Encapsulates: font-family, font-size, font-weight, letter-spacing, text-transform.
 * All other styling (color, margin, opacity) must come from the caller via `className`.
 *
 * Variants:
 * - sm         Section tag labels, column headings — sm, tracking-wide
 * - default    Platform labels, breakdown headers, UI meta text — sm, tracking-wide
 * - micro      Testimonial badges, scroll indicator, sub-titles — xs, tracking-wide
 * - label      Section labels — 10px, tracking-[0.3em]
 * - meta       Order meta, timestamps — 10px, tracking-[0.2em]
 * - badge      Status badges — 10px, tracking-[0.15em]
 * - value      Data values — xs→sm, tracking-[0.15em]
 * - metric     Large metric display — 6xl-7xl, Anton font
 * - serif      Serif-italic accent word inside headings — inherits size from parent
 */

const spanVariants = {
  sm: "font-body text-base font-semibold uppercase tracking-wide",
  default: "font-body text-sm font-semibold uppercase tracking-wide",
  micro: "font-body text-xs font-medium uppercase tracking-wide",
  label: "font-body text-sm font-bold uppercase tracking-[0.3em]",
  meta: "font-body text-xs md:text-sm font-bold uppercase tracking-[0.2em]",
  badge: "font-body text-xs font-bold uppercase tracking-[0.15em]",
  value: "font-body text-sm md:text-base font-bold uppercase tracking-[0.15em]",
  metric: "font-(family-name:--font-bebas-neue) text-7xl md:text-8xl uppercase tracking-tighter",
  serif: "font-serif italic lowercase font-light",
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
