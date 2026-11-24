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
        className="mb-4 inline-block rounded-md bg-(--color-stamp-gold) px-3 py-1 text-(--color-stamp-chocolate)"
      >
        Step {step.number}
      </Span>

      <Heading
        as="h3"
        variant="card"
        className="mb-4 text-(--color-stamp-chocolate)"
      >
        {title}
      </Heading>

      <Paragraph
        variant="loose"
        className="max-w-xl text-sm leading-relaxed text-(--color-stamp-taupe) sm:text-base lg:text-lg"
      >
        {description}
      </Paragraph>
    </div>
  );
}
