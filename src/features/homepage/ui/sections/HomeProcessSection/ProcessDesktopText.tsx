/**
 * ProcessDesktopText
 *
 * Desktop text content for a process step with slide animation.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { HomeProcessStepType } from "../../../lib/constants/homepageContent";

interface ProcessDesktopTextPropsI {
  step: HomeProcessStepType;
  title: string;
  description: string;
  translateY: number;
  opacity: number;
  isActive: boolean;
}

export function ProcessDesktopText({
  step,
  title,
  description,
  translateY,
  opacity,
  isActive,
}: ProcessDesktopTextPropsI) {
  return (
    <div
      className="absolute inset-x-0"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <Span
        variant="badge"
        className="inline-block px-3 py-1 mb-4 bg-(--color-stamp-gold) text-(--color-stamp-cream) rounded-full shadow-sm"
      >
        Step {step.number}
      </Span>

      <Heading
        as="h3"
        variant="section"
        className="mb-4 text-(--color-stamp-chocolate)"
      >
        {title}
      </Heading>

      <Paragraph
        variant="loose"
        className="text-(--color-stamp-chocolate)/70 text-sm sm:text-base lg:text-lg leading-relaxed"
      >
        {description}
      </Paragraph>
    </div>
  );
}
