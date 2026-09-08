import { cn } from "@/lib/utils";

/**
 * Heading
 *
 * Typography atom for headings.
 * Encapsulates: font-family, font-size (responsive), line-height, letter-spacing, text-transform.
 * All other styling (color, margin, opacity, effects) must come from the caller via `className`.
 *
 * Variants:
 * - display        Hero h1 — massive fluid viewport-relative title (Sanchez)
 * - sectionDisplay Section header h2 — large display style (Sanchez)
 * - sectionSlab    Section header h2 — smaller slab-serif style (Sanchez)
 * - cta            CTA section h2 — large fluid viewport-relative title (Sanchez)
 * - section        Section header h2 — 5xl→7xl (Sanchez)
 * - title          Interior section h2 — fixed responsive scale 6xl→8xl (Sanchez)
 * - panelTitle     Split-panel h2 — fluid size that fits a half-width grid column (Sanchez)
 * - panelTitleCompact Compact panel h2 — smaller fluid size for profile cards (Sanchez)
 * - card           Card / step h3 — 3xl→4xl (Sanchez)
 * - cardCompact    Compact card title — xl (Sanchez)
 * - question       FAQ summary — 2xl→3xl (Sanchez)
 * - item           Product name / testimonial author — xl→2xl (Inter)
 * - itemCompact    Compact product name — base (Inter)
 * - price          Large price display — 2xl (Inter)
 * - priceCompact   Compact price display — xl (Inter)
 * - priceMini      Small inline price — base (Inter)
 */

const headingVariants = {
  display:
    "font-heading font-normal text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-tight",
  sectionDisplay:
    "font-heading font-normal text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none uppercase",
  sectionSlab:
    "font-heading font-normal text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight",
  cta: "font-heading font-normal text-[10vw] md:text-[8vw] lg:text-[6vw] leading-[0.95] tracking-tight",
  section:
    "font-heading font-normal text-2xl md:text-5xl lg:text-7xl tracking-tight leading-none",
  title:
    "font-heading font-normal text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none",
  panelTitle:
    "font-heading font-normal text-[clamp(1.875rem,9vw,3.75rem)] md:text-[clamp(2.5rem,4.75vw,6rem)] tracking-tight leading-none",
  panelTitleCompact:
    "font-heading font-normal text-3xl md:text-4xl tracking-tight leading-none",
  card: "font-heading font-normal text-3xl md:text-4xl tracking-tight leading-tight",
  cardCompact: "font-heading font-normal text-xl tracking-tight leading-tight",
  question:
    "font-heading font-normal text-2xl md:text-3xl tracking-tight leading-tight",
  item: "font-body font-semibold text-xl md:text-2xl tracking-tight",
  itemCompact: "font-body font-semibold text-lg md:text-xl tracking-tight",
  price: "font-body font-bold text-xl md:text-2xl tracking-tight",
  priceCompact: "font-body font-bold text-xl tracking-tight",
  priceMini: "font-body font-semibold text-base tracking-tight",
} as const;

type HeadingVariant = keyof typeof headingVariants;
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
