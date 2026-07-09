import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for heading-family body/description text.
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
  lead: "font-heading text-base md:text-lg lg:text-xl font-light tracking-wide uppercase leading-relaxed",
  body: "font-heading text-base tracking-wide uppercase leading-relaxed",
  sm: "font-heading text-sm tracking-wide uppercase leading-relaxed",
  loose: "font-heading text-sm tracking-wide uppercase leading-loose",
  card: "font-heading text-sm md:text-base tracking-wide uppercase leading-relaxed",
  faq: "font-heading text-sm md:text-base tracking-wide uppercase leading-loose",
  quote: "font-heading text-base tracking-wide leading-relaxed",
} as const;

export type ParagraphVariant = keyof typeof paragraphVariants;
type ParagraphTag = "p" | "div" | "span";

interface ParagraphProps extends React.HTMLAttributes<HTMLElement> {
  as?: ParagraphTag;
  variant?: ParagraphVariant;
  unstyled?: boolean;
}

export function Paragraph({
  as: Tag = "p",
  variant = "body",
  unstyled = false,
  className,
  children,
  ...props
}: ParagraphProps) {
  return (
    <Tag
      className={cn(!unstyled && paragraphVariants[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
