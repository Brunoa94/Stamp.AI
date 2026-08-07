"use client";

import { ReactNode } from "react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

/**
 * CoinsOverlayShell
 *
 * Shared frosted-glass layout for the coins overlays: backdrop, icon badge,
 * heading, description and the variant's actions as children.
 */

interface PropsI {
  testId: string;
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function CoinsOverlayShell({
  testId,
  icon,
  iconClassName,
  title,
  description,
  children,
}: PropsI) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-(--color-stamp-cream)/80 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-sm">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </div>
        <div className="space-y-2">
          <Heading
            as="h3"
            variant="cardCompact"
            className="text-(--color-stamp-chocolate)"
          >
            {title}
          </Heading>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {description}
          </Paragraph>
        </div>
        {children}
      </div>
    </div>
  );
}
