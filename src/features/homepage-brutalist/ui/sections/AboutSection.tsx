"use client";

import { brutalistAboutCards } from "@/features/homepage-brutalist/lib/constants/brutalistContent";

/**
 * About Section Component
 *
 * Features:
 * - 12-column grid split 5/7
 * - Left: Heading + blockquote
 * - Right: 2×2 grid of value cards with hard shadows
 * - Staggered vertical positioning
 */

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-32 px-8 bg-concrete text-ink overflow-hidden"
    >
      {/* Decorative blur blob */}
      <div className="absolute top-1/2 right-0 w-[40vw] h-[40vw] bg-brandPurple/10 blur-[150px] rounded-full" />

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
        {/* Left: Heading + Blockquote */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h2 className="font-anton text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-none mb-12">
            Democratizing
            <br />
            Design
          </h2>

          <blockquote className="border-l-4 border-brandPurple pl-8 mb-8">
            <p className="text-sm md:text-base leading-relaxed uppercase tracking-wide font-space font-light mb-6">
              "We believe exceptional design should be accessible to everyone.
              Our AI synthesis engine transforms creative vision into
              archival-quality apparel in seconds—no design experience
              required."
            </p>
            <footer className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-50 font-space">
              — STAMP.AI MANIFESTO
            </footer>
          </blockquote>

          <div className="text-xs leading-loose uppercase tracking-wide font-space font-light opacity-60 max-w-md">
            Founded in 2024, STAMP.AI merges machine learning with textile
            engineering to create a new paradigm for custom apparel production.
          </div>
        </div>

        {/* Right: Value Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {brutalistAboutCards.map((card, index) => (
            <div
              key={card.id}
              id={card.id}
              className={`bg-white border-2 ${card.color} p-8 lg:p-10 flex flex-col justify-between min-h-60 shadow-[8px_8px_0px_rgba(10,10,10,0.05)] hover:shadow-[12px_12px_0px_rgba(10,10,10,0.1)] transition-all duration-300 group ${
                index % 2 === 1 ? "sm:translate-y-8" : ""
              }`}
            >
              {/* Icon/Number placeholder */}
              <div className="mb-6">
                <span className="font-anton text-5xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-anton text-2xl md:text-3xl uppercase tracking-tight mb-4">
                  {card.title}
                </h3>
                <p className="text-xs leading-relaxed uppercase tracking-wide font-space opacity-70">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
