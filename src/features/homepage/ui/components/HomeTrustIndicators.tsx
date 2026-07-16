/**
 * HomeTrustIndicators
 *
 * Row of colored-dot + uppercase label trust items used under hero/CTA copy.
 * Supports inverted mode for dark backgrounds.
 */

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

const DOT_COLORS = ["bg-(--color-stamp-gold)", "bg-(--color-stamp-chocolate)", "bg-(--color-stamp-taupe)"];

interface HomeTrustIndicatorsPropsI {
  items: string[];
  className?: string;
  inverted?: boolean;
}

const SUB_LABEL_KEYS = ["generative", "heritage", "logistics"] as const;

export function HomeTrustIndicators({
  items,
  className,
  inverted = false,
}: HomeTrustIndicatorsPropsI) {
  const t = useTranslations("home.trustIndicators");

  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-10",
        className
      )}
    >
      {items.map((item, index) => (
        <li key={item} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[index % DOT_COLORS.length])}
            />
            <Span
              variant="micro"
              className={inverted ? "text-(--color-stamp-cream)" : "text-(--color-stamp-chocolate)"}
            >
              {t(`items.${item}`)}
            </Span>
          </div>
          <Span
            variant="micro"
            className={inverted ? "text-(--color-stamp-cream)/40" : "text-(--color-stamp-taupe)"}
            style={{ letterSpacing: "0.2em" }}
          >
            {SUB_LABEL_KEYS[index] && t(`subLabels.${SUB_LABEL_KEYS[index]}`)}
          </Span>
        </li>
      ))}
    </ul>
  );
}
