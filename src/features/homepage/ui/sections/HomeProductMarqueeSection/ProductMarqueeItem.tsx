import { Sparkle } from "lucide-react";
import { Span } from "@/features/ui/span";

interface PropsI {
  label: string;
  /** Renders the label in gold instead of off-white, for alternating items */
  isAccent?: boolean;
}

/**
 * ProductMarqueeItem
 *
 * One product range in the marquee band, followed by a gold sparkle divider.
 * Label colour alternates between off-white and gold via isAccent (band / bandAccent variants).
 */
export function ProductMarqueeItem({ label, isAccent = false }: PropsI) {
  return (
    <Span
      unstyled
      className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
    >
      <Span
        variant={isAccent ? "bandAccent" : "band"}
        className="whitespace-nowrap"
      >
        {label}
      </Span>
      <Sparkle
        className="size-5 shrink-0 text-(--color-stamp-gold) md:size-6"
        strokeWidth={1.5}
      />
    </Span>
  );
}
