/**
 * HomeProcessSection
 *
 * "The Process" — six protocol steps as luxury cards with oversized
 * gold step numbers that reveal in color on hover.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_PROCESS_STEPS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { cn } from "@/lib/utils";
import { SectionReveal } from "../components/SectionReveal";

const STEP_COLORS = [
  {
    border: "hover:border-(--color-stamp-gold)",
    text: "group-hover:text-(--color-stamp-gold)",
  },
  {
    border: "hover:border-(--color-stamp-chocolate)",
    text: "group-hover:text-(--color-stamp-chocolate)",
  },
  {
    border: "hover:border-(--color-stamp-taupe)",
    text: "group-hover:text-(--color-stamp-taupe)",
  },
];

export function HomeProcessSection() {
  return (
    <section
      id="process"
      className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24"
    >
      <SectionReveal className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader title="The" accent="process" label="Protocol 001" />

        {/* Mobile: Horizontal carousel */}
        <div className="sm:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
            {HOME_PROCESS_STEPS.map((step, index) => {
              const colorIndex = index % STEP_COLORS.length;
              const colors = STEP_COLORS[colorIndex];

              return (
                <article
                  key={step.id}
                  id={step.id}
                  className={cn(
                    "group flex w-72 min-h-52 shrink-0 flex-col justify-between border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500",
                    colors.border,
                  )}
                >
                  <Span
                    variant="metric"
                    className={cn(
                      "text-(--color-stamp-gold)/20 transition-colors duration-500 text-6xl",
                      colors.text,
                    )}
                  >
                    {step.number}
                  </Span>
                  <div className="mt-6">
                    <Heading as="h3" variant="card" className="mb-2">
                      {step.title}
                    </Heading>
                    <Paragraph
                      variant="card"
                      className="text-(--color-stamp-taupe) text-sm"
                    >
                      {step.description}
                    </Paragraph>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden sm:grid grid-cols-2 gap-8 lg:grid-cols-3">
          {HOME_PROCESS_STEPS.map((step, index) => {
            const colorIndex = index % STEP_COLORS.length;
            const colors = STEP_COLORS[colorIndex];

            return (
              <article
                key={step.id}
                id={step.id}
                className={cn(
                  "group flex min-h-72 flex-col justify-between border border-(--color-stamp-divider) bg-(--color-stamp-white) p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-(--shadow-stamp-card-hover)",
                  colors.border,
                )}
              >
                <Span
                  variant="metric"
                  className={cn(
                    "text-(--color-stamp-gold)/20 transition-colors duration-500",
                    colors.text,
                  )}
                >
                  {step.number}
                </Span>
                <div>
                  <Heading as="h3" variant="card" className="mb-3">
                    {step.title}
                  </Heading>
                  <Paragraph
                    variant="card"
                    className="text-(--color-stamp-taupe)"
                  >
                    {step.description}
                  </Paragraph>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <Span variant="sm" className="text-(--color-stamp-taupe)/40">
            Engineered for precision
          </Span>
        </div>
      </SectionReveal>
    </section>
  );
}
