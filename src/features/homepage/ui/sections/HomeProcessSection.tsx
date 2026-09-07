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
    <section id="process" className="relative bg-(--color-stamp-cream) overflow-x-clip">
      {/* Decorative gold accent lines */}
      <div className="absolute top-12 left-6 lg:left-12 xl:left-24 w-28 h-1 bg-(--color-stamp-gold)/40 rounded-full z-10" aria-hidden="true" />
      <div className="absolute top-12 right-6 lg:right-12 xl:right-24 w-28 h-1 bg-(--color-stamp-gold)/40 rounded-full z-10" aria-hidden="true" />

      {/* Decorative corner frames */}
      <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-t-2 border-l-2 border-(--color-stamp-gold)/25 rounded-tl-lg z-10" aria-hidden="true" />
      <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-t-2 border-r-2 border-(--color-stamp-gold)/25 rounded-tr-lg z-10" aria-hidden="true" />

      <ProcessStickyCarousel />
    </section>
  );
}
