"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STAMP_SPLIT_TONES } from "../../lib/constants/stampBackdrops";
import { getStampSplitToneStyle } from "../../lib/helpers/stampSplitToneHelpers";
import { isStampBackdropVisible } from "../../lib/helpers/stampBackdropHelpers";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { useStampSplitTone } from "../../lib/hooks/useStampSplitTone";
import { splitToneTextVariants } from "../../lib/variants/splitToneTextVariants";

/**
 * SplitToneText
 *
 * Text that changes colour exactly where the stamp canvas backdrop's diagonal
 * edge crosses it: dark on the off-white, light on the photo. A crossed
 * element gets a hard two-colour gradient clipped to its glyphs. Wrap text
 * only, never icons: on a split the colour is transparent, which would hide a
 * `currentColor` SVG. `className` can override the off-white colour per
 * breakpoint (e.g. light text on a dark mobile panel). Padding with a matching
 * negative margin keeps glyph overhangs, like an italic descender, painted.
 */

interface PropsI {
  tone?: keyof typeof STAMP_SPLIT_TONES;
  className?: string;
  children: ReactNode;
}

export function SplitToneText({ tone = "title", className, children }: PropsI) {
  const { currentStep } = useStampNavigation();
  const { ref, tone: splitTone } = useStampSplitTone<HTMLSpanElement>(
    isStampBackdropVisible(currentStep),
  );

  return (
    // eslint-disable-next-line no-restricted-syntax -- needs a ref to measure its position against the backdrop edge; Span doesn't take refs
    <span
      ref={ref}
      className={cn(splitToneTextVariants({ tone }), className)}
      style={getStampSplitToneStyle(splitTone, STAMP_SPLIT_TONES[tone])}
    >
      {children}
    </span>
  );
}
