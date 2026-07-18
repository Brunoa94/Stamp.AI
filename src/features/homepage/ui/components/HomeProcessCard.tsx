"use client";

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { PROCESS_STEP_COLORS } from "../../lib/constants/homepageContent";

interface HomeProcessCardProps {
  id: string;
  number: string;
  title: string;
  description: string;
  index: number;
  isVisible: boolean;
  variant?: "mobile" | "desktop";
}

/**
 * HomeProcessCard
 *
 * Individual process step card with staggered reveal animation.
 * Supports mobile (compact) and desktop (full) variants.
 */
export function HomeProcessCard({
  id,
  number,
  title,
  description,
  index,
  isVisible,
  variant = "desktop",
}: HomeProcessCardProps) {
  const colorIndex = index % PROCESS_STEP_COLORS.length;
  const colors = PROCESS_STEP_COLORS[colorIndex];

  const isMobile = variant === "mobile";

  return (
    <article
      id={id}
      className={cn(
        "group flex flex-col justify-between border border-(--color-stamp-divider) bg-(--color-stamp-white)",
        "process-card-reveal",
        isMobile
          ? "process-card-reveal--mobile w-72 min-h-52 shrink-0 p-8"
          : "min-h-72 p-10 hover:-translate-y-1 hover:shadow-(--shadow-stamp-card-hover)",
        isVisible && "process-card-reveal--visible",
        colors.border
      )}
    >
      <Span
        variant="metric"
        className={cn(
          "text-(--color-stamp-gold)/20 transition-colors duration-500",
          isMobile && "text-6xl",
          colors.text
        )}
      >
        {number}
      </Span>
      <div className={isMobile ? "mt-6" : undefined}>
        <Heading as="h3" variant="card" className={isMobile ? "mb-2" : "mb-3"}>
          {title}
        </Heading>
        <Paragraph
          variant="card"
          className={cn("text-(--color-stamp-taupe)", isMobile && "text-sm")}
        >
          {description}
        </Paragraph>
      </div>
    </article>
  );
}
