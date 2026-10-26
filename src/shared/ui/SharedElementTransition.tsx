"use client";

import type { ReactElement } from "react";
import { ViewTransition } from "./ViewTransition";

/**
 * SharedElementTransition
 *
 * Morphs an element between two places that render it under the same
 * `name` (e.g. a grid thumbnail and the matching dialog image).
 *
 * React pairs a shared transition only when one named boundary unmounts
 * and another mounts in the same Transition commit, and two boundaries may
 * not share a name at once. A source that stays mounted (the thumbnail)
 * sets `isActive={false}` while the target is shown, so the name hands
 * over in a single commit. While inactive the children render unwrapped.
 */

interface PropsI {
  name: string;
  isActive?: boolean;
  /** View transition class for the morph, styled via ::view-transition-group(.<share>). */
  share?: string;
  children: ReactElement;
}

export function SharedElementTransition({
  name,
  isActive = true,
  share = "auto",
  children,
}: PropsI) {
  if (!isActive) return children;

  return (
    <ViewTransition name={name} share={share} default="none">
      {children}
    </ViewTransition>
  );
}
