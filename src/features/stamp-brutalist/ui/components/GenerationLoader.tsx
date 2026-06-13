"use client";

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function GenerationLoader() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Gradient bar */}
      <div className="h-1.5 w-20 bg-linear-to-r from-brandOrange to-transparent mb-6 mx-auto" />

      {/* Animated rings and dot */}
      <div className="relative w-48 h-48 mx-auto mb-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-brandCyan rounded-full animate-ping opacity-20"></div>

        {/* Middle ring */}
        <div className="absolute inset-6 border-2 border-brandPurple rounded-full animate-ping opacity-30 generation-ring-delayed"></div>

        {/* Central animated dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animated-dot w-16! h-16! shadow-[0_0_50px_rgba(251,146,60,0.5)]"></div>
        </div>
      </div>

      {/* Text */}
      <Heading variant="title" className="mb-4">
        Synthesizing Neural Art
      </Heading>

      <Paragraph variant="card" className="opacity-40 mb-12">
        ESTIMATED COMPLETION: 12.4s
      </Paragraph>

      {/* Progress bar */}
      <div className="w-full bg-ink/5 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-linear-to-r from-brandPurple via-brandCyan to-brandOrange transition-all duration-1000 generation-progress-bar" />
      </div>
    </div>
  );
}
