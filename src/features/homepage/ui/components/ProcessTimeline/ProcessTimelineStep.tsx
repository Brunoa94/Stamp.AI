/**
 * ProcessTimelineStep
 *
 * Individual step in the auto-playing timeline.
 * Clean, minimal design with smooth animations.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface ProcessTimelineStepProps {
  number: string;
  title: string;
  description: string;
  isActive: boolean;
  isPast: boolean;
  progress: number;
}

export function ProcessTimelineStep({
  number,
  title,
  description,
  isActive,
  isPast,
  progress,
}: ProcessTimelineStepProps) {
  // Smooth transforms based on state
  const getTransform = () => {
    if (isPast) return `translateY(${-30 * progress}px)`;
    if (!isActive && !isPast) return `translateY(${30 * (1 - progress)}px)`;
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
      <div className="w-full">
        {/* Step Number - Large, elegant with full-width line */}
        <div className="mb-8 flex items-center gap-8">
          <Span
            variant="serif"
            className={cn(
              "text-7xl transition-colors duration-500 sm:text-8xl md:text-9xl lg:text-[10rem]",
              isActive
                ? "text-(--color-stamp-gold)"
                : "text-(--color-stamp-chocolate)/10"
            )}
          >
            {number}
          </Span>
          <div
            className={cn(
              "h-px flex-1 transition-all duration-500",
              isActive
                ? "bg-(--color-stamp-gold)"
                : "bg-(--color-stamp-chocolate)/10"
            )}
          />
        </div>

        {/* Content */}
        <div>
          <Heading
            as="h3"
            variant="card"
            className={cn(
              "mb-4 transition-colors duration-500",
              isActive
                ? "text-(--color-stamp-chocolate)"
                : "text-(--color-stamp-chocolate)/30"
            )}
          >
            {title}
          </Heading>
          <Paragraph
            variant="loose"
            className={cn(
              "max-w-2xl transition-colors duration-500",
              isActive
                ? "text-(--color-stamp-taupe)"
                : "text-(--color-stamp-taupe)/30"
            )}
          >
            {description}
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
