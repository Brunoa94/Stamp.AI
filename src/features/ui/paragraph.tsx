import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for Space Grotesk body/description text.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, max-width) must come from the caller via `className`.
 *
 * Variants:
 * - lead     Hero/CTA subtitle — responsive sm→base→lg, font-light, uppercase, relaxed leading
 * - body     Blockquote / testimonial body — sm, uppercase, relaxed leading
 * - sm       Card descriptions — xs, uppercase, relaxed leading
 * - loose    Muted descriptive copy — xs, font-light, uppercase, loose leading
 * - card     Process / FAQ responsive body — xs→sm, uppercase, relaxed leading
 * - faq      FAQ answer — xs→sm, uppercase, loose leading
 * - quote    Testimonial quote — sm, NO uppercase, relaxed leading
 */

const paragraphVariants = {
  lead: "font-space text-sm md:text-base lg:text-lg font-light tracking-wide uppercase leading-relaxed",
  body: "font-space text-sm tracking-wide uppercase leading-relaxed",
  sm: "font-space text-xs tracking-wide uppercase leading-relaxed",
  loose: "font-space text-xs tracking-wide uppercase leading-loose",
  card: "font-space text-xs md:text-sm tracking-wide uppercase leading-relaxed",
  faq: "font-space text-xs md:text-sm tracking-wide uppercase leading-loose",
  quote: "font-space text-sm tracking-wide leading-relaxed",
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
  variant = "body",
  className,
  children,
}: ParagraphProps) {
  return (
    <Tag className={cn(paragraphVariants[variant], className)}>{children}</Tag>
  );
}
