import type { ReactNode } from "react";
import { Heading } from "@/features/ui/heading";
import { cn } from "@/lib/utils";
import { SplitToneText } from "./SplitToneText";

/**
 * StampStepTitle
 *
 * The title of a studio step panel, in the Stamp section-header order: an
 * amber accent bar, then the sentence-case slab-serif title. The title
 * switches to light colours where it crosses onto the canvas backdrop photo
 * (SplitToneText); wrap its accent word in StampTitleAccent.
 */

interface PropsI {
  children: ReactNode;
  className?: string;
}

export function StampStepTitle({ children, className }: PropsI) {
  return (
    <div className={cn("mb-4 md:mb-6", className)}>
      <div aria-hidden="true" className="mb-4 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Heading as="h2" variant="panelTitle">
        <SplitToneText className="block pb-2 -mb-2">{children}</SplitToneText>
      </Heading>
    </div>
  );
}
