"use client";

import { brutalistAboutCards } from "@/features/homepage-brutalist/lib/constants/brutalistContent";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

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
          <Heading as="h2" variant="title" className="mb-12">
            Democratizing
            <br />
            Design
          </Heading>

          <blockquote className="border-l-4 border-brandPurple pl-8 mb-8">
            <Paragraph className="md:text-base font-light mb-6">
              "We believe exceptional design should be accessible to everyone.
              Our AI synthesis engine transforms creative vision into
              archival-quality apparel in seconds—no design experience
              required."
            </Paragraph>
            <Span as="footer" variant="default" className="opacity-50">
              — STAMP.AI MANIFESTO
            </Span>
          </blockquote>

          <Paragraph className="font-light opacity-60 max-w-md">
            Founded in 2024, STAMP.AI merges machine learning with textile
            engineering to create a new paradigm for custom apparel production.
          </Paragraph>
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
                <Span className="font-anton text-5xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {String(index + 1).padStart(2, "0")}
                </Span>
              </div>

              {/* Content */}
              <div>
                <Heading as="h3" variant="card" className="mb-4">
                  {card.title}
                </Heading>
                <Paragraph className="opacity-70">
                  {card.description}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
