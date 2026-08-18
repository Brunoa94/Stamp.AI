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
      <div className="mb-3 relative aspect-video w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-lg">
        {imageData && (
          <Image
            src={imageData.src}
            alt={imageData.alt}
            fill
            sizes="(max-width: 640px) 384px, 448px"
            className="object-cover"
            priority={isPriority}
          />
        )}
        <div className="absolute bottom-3 left-3 w-8 h-8 flex items-center justify-center bg-(--color-stamp-gold) rounded-full shadow-md">
          <Span variant="micro" className="text-(--color-stamp-cream)">
            {step.number}
          </Span>
        </div>
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
