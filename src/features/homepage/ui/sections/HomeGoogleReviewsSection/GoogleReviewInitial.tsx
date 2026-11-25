/**
 * GoogleReviewInitial
 *
 * Stand-in avatar for a reviewer without a Google profile photo.
 */

import { Span } from "@/features/ui/span";

interface PropsI {
  name: string;
}

export function GoogleReviewInitial({ name }: PropsI) {
  return (
    <Span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-stamp-peach) text-(--color-stamp-chocolate)"
    >
      {name.charAt(0).toUpperCase()}
    </Span>
  );
}
