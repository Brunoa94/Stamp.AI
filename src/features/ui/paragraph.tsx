import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for Space Grotesk body/description text.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, max-width) must come from the caller via `className`.
 *
 * Variants:
 * - primary  The single paragraph style used across all sections — xs→sm, uppercase, relaxed leading
 *
 * `primary` is intentionally the only variant available; every paragraph in the
 * app must reuse it to keep the design system consistent.
 */

const paragraphVariants = {
  primary:
    "font-space text-xs md:text-sm tracking-wide uppercase leading-relaxed",
} as const;

export type ParagraphVariant = keyof typeof paragraphVariants;
type ParagraphTag = "p" | "div" | "span";

interface ParagraphProps {
  as?: ParagraphTag;
  variant?: ParagraphVariant;
  className?: string;
  children: React.ReactNode;
}

export function Paragraph({
  as: Tag = "p",
  variant = "primary",
  className,
  children,
}: ParagraphProps) {
  return (
    <Tag className={cn(paragraphVariants[variant], className)}>{children}</Tag>
  );
}
