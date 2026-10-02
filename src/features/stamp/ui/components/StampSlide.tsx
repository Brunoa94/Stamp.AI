"use client";

import type { ReactNode } from "react";

interface PropsI {
  /** Position of this slide in the vertical track (0 = hero). */
  index: number;
  /** The slide currently shown by the track. */
  activeSlide: number;
  children: ReactNode;
}

/**
 * StampSlide
 *
 * Every step of the stamp flow stays mounted inside the sliding track so step
 * transitions animate and state survives. Steps that are not on screen must
 * not be reachable though: `inert` removes them from focus/interaction and
 * `aria-hidden` from the accessibility tree, so an off-screen "Bag it" or
 * "Create product" can never be activated for the wrong step.
 */
export function StampSlide({ index, activeSlide, children }: PropsI) {
  const inactive = index !== activeSlide;
  return (
    <div className="h-full" inert={inactive} aria-hidden={inactive}>
      {children}
    </div>
  );
}
