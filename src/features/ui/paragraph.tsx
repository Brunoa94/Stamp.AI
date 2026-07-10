import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for heading-family body/description text.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, max-width) must come from the caller via `className`.
 *
 * Variants:
 * - lead     Hero/CTA subtitle — responsive base→lg→xl, font-light, uppercase, relaxed leading
 * - body     Blockquote / testimonial body — lg, uppercase, relaxed leading
 * - sm       Card descriptions — base, uppercase, relaxed leading
 * - loose    Muted descriptive copy — base, font-light, uppercase, loose leading
 * - card     Process / FAQ responsive body — base→lg, uppercase, relaxed leading
 * - faq      FAQ answer — base→lg, uppercase, loose leading
 * - quote    Testimonial quote — lg, NO uppercase, relaxed leading
 */

const paragraphVariants = {
  lead: "font-heading text-xl md:text-2xl lg:text-3xl font-light tracking-wide uppercase leading-relaxed",
  body: "font-heading text-xl tracking-wide uppercase leading-relaxed",
  sm: "font-heading text-lg tracking-wide uppercase leading-relaxed",
  loose: "font-heading text-lg tracking-wide uppercase leading-loose",
  card: "font-heading text-lg md:text-xl tracking-wide uppercase leading-relaxed",
  faq: "font-heading text-lg md:text-xl tracking-wide uppercase leading-loose",
  quote: "font-heading text-xl tracking-wide leading-relaxed",
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
