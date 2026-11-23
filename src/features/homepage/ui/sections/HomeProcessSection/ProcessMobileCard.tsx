/**
 * ProcessMobileCard
 *
 * Mobile card showing both the flow-demo screen and text content for a process step.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { HomeProcessStepType } from "../../../lib/constants/homepageContent";
import { ProcessFlowSnapshot } from "./ProcessFlowSnapshot";

interface ProcessMobileCardPropsI {
  step: HomeProcessStepType;
  title: string;
  description: string;
  translateY: number;
  opacity: number;
  scale: number;
  isActive: boolean;
}

export function ProcessMobileCard({
  step,
  title,
  description,
  translateY,
  opacity,
  scale,
  isActive,
}: ProcessMobileCardPropsI) {
  return (
    <div
      className="absolute inset-x-0 flex flex-col items-center"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        pointerEvents: isActive ? "auto" : "none",
        transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
      }}
    >
      {/* Mobile flow-demo screen, scaled down from its native size; the box height matches the scaled window */}
      <div className="mb-3 flex h-74 w-full justify-center sm:h-89">
        <ProcessFlowSnapshot
          step={step}
          label={description}
          className="origin-top scale-50 sm:scale-60"
        />
      </div>

      {/* Mobile text content */}
      <div className="text-center px-4">
        <Span
          variant="badge"
          className="mb-2 inline-block rounded-md bg-(--color-stamp-gold) px-3 py-1 text-(--color-stamp-chocolate)"
        >
          Step {step.number}
        </Span>

        <Heading
          as="h3"
          variant="card"
          className="mb-2 text-(--color-stamp-chocolate)"
        >
          {title}
        </Heading>

        <Paragraph
          variant="loose"
          className="text-sm leading-relaxed text-(--color-stamp-taupe) sm:text-base"
        >
          {description}
        </Paragraph>
      </div>
    </div>
  );
}
