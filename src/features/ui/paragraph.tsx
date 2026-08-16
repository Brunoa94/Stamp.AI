import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for heading-family body/description text.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, max-width) must come from the caller via `className`.
 *
 * Variants:
 * - lead        Hero/CTA subtitle — responsive lg→2xl, font-light, relaxed leading
 * - heroTagline Hero tagline — larger, medium weight, snug leading (stronger style)
 * - body        Blockquote / testimonial body — lg, uppercase, relaxed leading
 * - sm          Card descriptions — base, uppercase, relaxed leading
 * - xs          Compact descriptions — xs, relaxed leading
 * - loose       Muted descriptive copy — base, font-light, uppercase, loose leading
 * - card        Process / FAQ responsive body — base→lg, uppercase, relaxed leading
 * - faq         FAQ answer — base→lg, uppercase, loose leading
 * - quote       Testimonial quote — lg, NO uppercase, relaxed leading
 */

const paragraphVariants = {
  lead: "font-body text-lg md:text-xl lg:text-2xl font-light tracking-normal leading-relaxed",
  heroTagline:
    "font-body text-xl md:text-2xl lg:text-3xl font-medium tracking-tight leading-snug",
  body: "font-body text-lg md:text-xl font-normal tracking-normal leading-relaxed",
  sm: "font-body text-base md:text-lg font-normal tracking-normal leading-relaxed",
  xs: "font-body text-sm font-normal tracking-normal leading-relaxed",
  loose: "font-body text-base md:text-lg font-light tracking-normal leading-loose",
  card: "font-body text-base md:text-lg font-normal tracking-normal leading-relaxed",
  faq: "font-body text-base md:text-lg font-normal tracking-normal leading-relaxed",
  quote: "font-body text-lg md:text-xl font-normal italic tracking-normal leading-relaxed",
} as const;

type ParagraphVariant = keyof typeof paragraphVariants;
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
