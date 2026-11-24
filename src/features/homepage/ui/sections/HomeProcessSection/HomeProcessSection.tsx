/**
 * HomeProcessSection
 *
 * "The Process" — Brevo-style scroll-driven sticky carousel on a cream band.
 * Text content on left, imagery on right. Each step sticks while scrolling.
 */

"use client";

import { ProcessStickyCarousel } from "./ProcessStickyCarousel";

export function HomeProcessSection() {
  return (
    <section id="process" className="relative overflow-x-clip bg-(--color-stamp-cream)">
      <ProcessStickyCarousel />
    </section>
  );
}
