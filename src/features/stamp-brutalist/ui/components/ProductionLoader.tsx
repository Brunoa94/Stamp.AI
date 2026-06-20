"use client";

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Settings } from "lucide-react";

export function ProductionLoader() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Gradient bar */}
      <div className="h-1.5 w-20 bg-linear-to-r from-brandOrange to-transparent mb-6 mx-auto" />

      {/* Spinning icon */}
      <div className="relative w-48 h-48 mx-auto mb-16 flex items-center justify-center">
        <Settings className="w-32 h-32 text-brandOrange animate-spin opacity-60 drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]" />
      </div>

      {/* Text */}
      <Heading variant="title" className="mb-4">
        Finalizing Mockups
      </Heading>

      <Paragraph variant="card" className="opacity-40">
        GENERATING MOCKUPS...
      </Paragraph>
    </div>
  );
}
