"use client";

import { BrutalistSectionHeader } from "../components/BrutalistSectionHeader";
import { brutalistProcess } from "@/features/homepage-brutalist/lib/constants/brutalistContent";

/**
 * Process Section Component
 *
 * Features:
 * - Dark background (bg-ink)
 * - 6-step grid (1→2→3 columns responsive)
 * - Each card hovers to brand color (purple/cyan/orange/red rotation)
 * - Step number + title + description
 */

export function ProcessSection() {
  return (
    <section id="process" className="relative py-32 px-8 bg-ink text-white">
      {/* Decorative blur blob */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-brandCyan/5 blur-[150px] rounded-full" />

      <BrutalistSectionHeader
        className="relative z-10"
        title="The Process"
        label="PROTOCOL_001"
        inverted
      />

      {/* Process grid */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {brutalistProcess.map((step) => (
          <div
            key={step.id}
            id={step.id}
            className={`bg-ink border border-white/5 group p-10 min-h-75 flex flex-col justify-between transition-all duration-500 ${step.hoverColor} hover:border-white/20 hover:shadow-[8px_8px_0px_rgba(255,255,255,0.1)]`}
          >
            {/* Step number */}
            <span className="font-anton text-4xl md:text-5xl opacity-20 group-hover:opacity-100 transition-opacity duration-500">
              {step.number}
            </span>

            {/* Step content */}
            <div>
              <h3 className="font-anton text-2xl md:text-3xl mb-3 uppercase tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs md:text-sm leading-relaxed opacity-80 uppercase tracking-wide font-space">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom decorative element */}
      <div className="max-w-screen-2xl mx-auto mt-20 flex justify-center relative z-10">
        <div className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-10 font-space">
          ENGINEERED FOR PRECISION
        </div>
      </div>
    </section>
  );
}
