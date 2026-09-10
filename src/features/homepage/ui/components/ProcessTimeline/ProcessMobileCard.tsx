/**
 * ProcessMobileCard
 *
 * Mobile card showing both image and text content for a process step.
 */

import Image from "next/image";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { HomeProcessStepType } from "../../../lib/constants/homepageContent";
import type { ProcessStepImageType } from "../../../lib/constants/processStepImages";

interface ProcessMobileCardPropsI {
  step: HomeProcessStepType;
  imageData: ProcessStepImageType | undefined;
  title: string;
  description: string;
  translateY: number;
  opacity: number;
  scale: number;
  isActive: boolean;
  isPriority: boolean;
}

export function ProcessMobileCard({
  step,
  imageData,
  title,
  description,
  translateY,
  opacity,
  scale,
  isActive,
  isPriority,
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
      {/* Mobile image */}
      <div className="mb-3 flex items-center justify-center w-full max-w-sm sm:max-w-md">
        {imageData && (
          <Image
            src={imageData.src}
            alt={imageData.alt}
            width={500}
            height={500}
            className="w-auto h-auto max-w-full max-h-80 rounded-lg"
            priority={isPriority}
          />
        )}
      </div>

      {/* Mobile text content */}
      <div className="text-center px-4">
        <Span
          variant="badge"
          className="inline-block px-3 py-1 mb-2 bg-(--color-stamp-gold) text-(--color-stamp-cream) rounded-full shadow-sm"
        >
          Step {step.number}
        </Span>

        <Heading
          as="h3"
          variant="section"
          className="mb-2 text-(--color-stamp-chocolate)"
        >
          {title}
        </Heading>

        <Paragraph
          variant="loose"
          className="text-(--color-stamp-chocolate)/70 text-sm sm:text-base leading-relaxed"
        >
          {description}
        </Paragraph>
      </div>
    </div>
  );
}
