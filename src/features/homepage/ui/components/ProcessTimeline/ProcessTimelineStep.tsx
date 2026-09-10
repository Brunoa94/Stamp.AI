/**
 * ProcessTimelineStep
 *
 * Individual step in the auto-playing timeline.
 * Number displayed inline with the step title.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface ProcessTimelineStepProps {
  title: string;
  description: string;
  isActive: boolean;
  isPast: boolean;
  progress: number;
}

export function ProcessTimelineStep({
  title,
  description,
  isActive,
  isPast,
  progress,
}: ProcessTimelineStepProps) {
  const getTransform = () => {
    if (isPast) return `translateY(${-20 * progress}px)`;
    if (!isActive && !isPast) return `translateY(${20 * (1 - progress)}px)`;
    return "translateY(0)";
  };

  const getOpacity = () => {
    if (isPast) return Math.max(0, 1 - progress * 1.5);
    if (!isActive && !isPast) return Math.min(1, progress * 1.5);
    return 1;
  };

  return (
    <div
      className="absolute inset-0 flex items-center pointer-events-none"
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
      }}
    >
      <div className="w-full max-w-2xl">
        <Heading
          as="h3"
          variant="card"
          className={cn(
            "mb-4 transition-colors duration-300",
            isActive
              ? "text-(--color-stamp-chocolate)"
              : "text-(--color-stamp-chocolate)/30",
          )}
        >
          {title}
        </Heading>
        <Paragraph
          variant="loose"
          className={cn(
            "transition-colors duration-300",
            isActive
              ? "text-(--color-stamp-taupe)"
              : "text-(--color-stamp-taupe)/30",
          )}
        >
          {description}
        </Paragraph>
      </div>
    </div>
  );
}
