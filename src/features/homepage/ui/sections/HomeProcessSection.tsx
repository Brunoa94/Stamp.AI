/**
 * HomeProcessSection
 *
 * "The Process" — Brevo-style scroll-driven sticky carousel.
 * Text content on left, imagery on right. Each step sticks while scrolling.
 */

"use client";

import { ProcessStickyCarousel } from "../components/ProcessTimeline/ProcessStickyCarousel";

export function HomeProcessSection() {
  return (
    <section id="process" className="bg-(--color-stamp-cream)">
      <ProcessStickyCarousel />
    </section>
  );
}
