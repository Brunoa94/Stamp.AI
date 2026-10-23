import type { HeroRotatingWordStateType } from "@/features/homepage/lib/types/heroShowcase";

/** Whether a headline word is showing, sliding out (the one before), or waiting to slide in */
export function getRotatingWordState(
  wordIndex: number,
  activeIndex: number,
  total: number,
): HeroRotatingWordStateType {
  if (wordIndex === activeIndex) return "active";
  if (wordIndex === (activeIndex - 1 + total) % total) return "leaving";
  return "waiting";
}
