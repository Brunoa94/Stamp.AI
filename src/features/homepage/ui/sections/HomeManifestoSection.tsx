"use client";

/**
 * HomeManifestoSection
 *
 * "Democratizing Design" — manifesto quote with gold rule and a staggered
 * 2×2 grid of value cards.
 *
 * On mobile, only the value cards (steps) are collapsible.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_VALUE_CARDS } from "../../lib/constants/homepageContent";
import { SectionReveal } from "../components/SectionReveal";

export function HomeManifestoSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className="px-6 py-24 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-10 h-1.5 w-20 bg-(--color-stamp-gold)" />
            <Heading
              as="h2"
              variant="title"
              className="mb-12 text-(--color-stamp-chocolate)"
            >
              Democratizing{" "}
              <Span variant="serif" className="text-(--color-stamp-taupe)">
                design
              </Span>
            </Heading>

            <blockquote className="border-l-2 border-(--color-stamp-gold) pl-8">
              <Paragraph
                variant="quote"
                className="text-(--color-stamp-chocolate)"
              >
                &ldquo;We believe exceptional design should be accessible to
                everyone. Our AI synthesis engine transforms creative vision
                into archival-quality apparel in seconds—no design experience
                required.&rdquo;
              </Paragraph>
              <Span
                as="footer"
                variant="micro"
                className="mt-6 text-(--color-stamp-taupe)"
              >
                — Stamp AI Manifesto
              </Span>
            </blockquote>

            <Paragraph
              variant="loose"
              className="mt-12 text-(--color-stamp-taupe)"
            >
              Founded in 2024, Stamp AI merges machine learning with textile
              engineering to create a new paradigm for custom apparel
              production.
            </Paragraph>
          </div>

          <div className="lg:col-span-7">
            {/* Mobile: Collapsible toggle for value cards */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mb-6 flex w-full items-center justify-between border-b border-(--color-stamp-divider) pb-4 text-left lg:hidden"
              aria-expanded={isExpanded}
              aria-controls="value-cards-content"
            >
              <Span
                variant="micro"
                className="uppercase tracking-widest text-(--color-stamp-taupe)"
              >
                Our Values
              </Span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-(--color-stamp-taupe) transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mobile: Collapsible value cards */}
            <div
              id="value-cards-content"
              className={`grid transition-all duration-300 ease-in-out lg:grid-rows-[1fr]! lg:opacity-100! ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr] lg:opacity-100"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {HOME_VALUE_CARDS.map((card, index) => (
                    <article
                      key={card.title}
                      className={`border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover) lg:p-10 ${
                        index % 2 === 1 ? "sm:translate-y-8" : ""
                      }`}
                    >
                      <Span variant="sm" className="text-(--color-stamp-gold)">
                        {card.number}
                      </Span>
                      <Heading as="h3" variant="card" className="mb-3 mt-6">
                        {card.title}
                      </Heading>
                      <Paragraph
                        variant="sm"
                        className="text-(--color-stamp-taupe)"
                      >
                        {card.description}
                      </Paragraph>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
