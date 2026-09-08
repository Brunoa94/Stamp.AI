import { cn } from "@/lib/utils";

/**
 * Paragraph
 *
 * Typography atom for body/description text using Inter font.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, max-width) must come from the caller via `className`.
 *
 * Variants:
 * - lead        Hero/CTA subtitle — xl→2xl→3xl, font-light, relaxed leading
 * - heroTagline Hero tagline — 2xl→3xl→4xl, medium weight, snug leading (stronger style)
 * - body        Blockquote / testimonial body — xl→2xl, relaxed leading
 * - sm          Card descriptions — lg→xl, relaxed leading
 * - xs          Compact descriptions — base, relaxed leading
 * - loose       Muted descriptive copy — lg→xl, font-light, loose leading
 * - card        Process / FAQ responsive body — lg→xl, relaxed leading
 * - faq         FAQ answer — lg→xl, loose leading
 * - quote       Testimonial quote — xl→2xl, italic, relaxed leading
 */

const paragraphVariants = {
  lead: "font-body text-xl md:text-2xl lg:text-3xl font-light tracking-normal leading-relaxed",
  heroTagline:
    "font-body text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight leading-snug",
  body: "font-body text-xl md:text-2xl font-normal tracking-normal leading-relaxed",
  sm: "font-body text-lg md:text-xl font-normal tracking-normal leading-relaxed",
  xs: "font-body text-base font-normal tracking-normal leading-relaxed",
  loose: "font-body text-lg md:text-xl font-light tracking-normal leading-loose",
  card: "font-body text-lg md:text-xl font-normal tracking-normal leading-relaxed",
  faq: "font-body text-lg md:text-xl font-normal tracking-normal leading-relaxed",
  quote: "font-body text-xl md:text-2xl font-normal italic tracking-normal leading-relaxed",
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
