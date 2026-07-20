import { cn } from "@/lib/utils";

/**
 * Heading
 *
 * Typography atom for headings.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, effects) must come from the caller via `className`.
 *
 * Variants:
 * - display        Hero h1 — massive fluid viewport-relative title (Outfit)
 * - cta            CTA section h2 — slightly smaller fluid title (Outfit)
 * - section        Section header h2 — fixed responsive scale 6xl→7xl (Outfit)
 * - sectionDisplay Section header h2 — bold condensed display style (Bebas Neue)
 * - title          Interior section h2 — fixed responsive scale 6xl→8xl (Outfit)
 * - card           Card / step h3 — 3xl→4xl (Outfit)
 * - cardCompact    Compact card title — xl (Outfit)
 * - question       FAQ summary — 2xl→3xl (Outfit)
 * - item           Product name / testimonial author — xl→2xl (Outfit)
 * - itemCompact    Compact product name — base (Outfit)
 * - price          Large price display — 2xl (Outfit)
 * - priceCompact   Compact price display — xl (Outfit)
 * - priceMini      Small inline price — base (Outfit)
 */

const headingVariants = {
  display:
    "font-heading font-bold text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase",
  cta: "font-heading font-bold text-[10vw] md:text-[8vw] lg:text-[6vw] leading-[0.9] tracking-tighter uppercase",
  section:
    "font-heading font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none uppercase",
  sectionDisplay:
    "font-(family-name:--font-bebas-neue) text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none uppercase",
  title:
    "font-heading font-bold text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-none uppercase",
  card: "font-heading font-semibold text-3xl md:text-4xl tracking-tight leading-tight uppercase",
  cardCompact:
    "font-heading font-semibold text-xl tracking-tight leading-tight uppercase",
  question:
    "font-heading font-semibold text-2xl md:text-3xl tracking-tight leading-tight uppercase",
  item: "font-heading font-medium text-xl md:text-2xl tracking-tight uppercase",
  itemCompact: "font-heading font-bold text-sm md:text-base tracking-tight uppercase",
  price: "font-heading font-black text-xl md:text-2xl tracking-tight uppercase",
  priceCompact: "font-heading font-black text-xl tracking-tight uppercase",
  priceMini: "font-heading font-black text-base tracking-tight uppercase",
} as const;

export type HeadingVariant = keyof typeof headingVariants;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

interface HeadingProps {
  as?: HeadingTag;
  variant?: HeadingVariant;
  unstyled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Heading({
  as: Tag = "h2",
  variant = "card",
  unstyled = false,
  className,
  children,
}: HeadingProps) {
  return (
    <Tag className={cn(!unstyled && headingVariants[variant], className)}>
      {children}
    </Tag>
  );
}
