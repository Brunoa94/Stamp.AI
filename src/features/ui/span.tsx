import { cn } from "@/lib/utils";

/**
 * Span
 *
 * Typography atom for small uppercase Space Grotesk label/meta text.
 * Encapsulates: font-family, font-size, font-weight, letter-spacing, text-transform.
 * All other styling (color, margin, opacity) must come from the caller via `className`.
 *
 * Variants:
 * - sm       Section tag labels, column headings — 11px, tracking-[0.4em]
 * - default  Platform labels, breakdown headers, UI meta text — 10px, tracking-[0.4em]
 * - micro    Testimonial badges, scroll indicator, sub-titles — 9px, tracking-[0.3em]
 * - metric   Large metric display — 5xl-6xl, Anton font
 */

const spanVariants = {
  sm: "font-space text-[11px] font-bold tracking-[0.4em] uppercase",
  default: "font-space text-[10px] font-bold tracking-[0.4em] uppercase",
  micro: "font-space text-[9px] font-bold tracking-[0.3em] uppercase",
  metric: "font-anton text-5xl md:text-6xl uppercase tracking-tighter",
} as const;

export type SpanVariant = keyof typeof spanVariants;
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
