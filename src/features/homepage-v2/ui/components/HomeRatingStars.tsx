/**
 * HomeRatingStars
 *
 * Row of five stars, gold-filled up to the given rating.
 */

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STARS = 5;

interface HomeRatingStarsPropsI {
  rating: number;
  className?: string;
}

export function HomeRatingStars({ rating, className }: HomeRatingStarsPropsI) {
  const filled = Math.floor(rating);

  return (
    <div
      role="img"
      aria-label={`Rated ${rating} out of ${TOTAL_STARS} stars`}
      className={cn("flex items-center gap-1", className)}
    >
      {Array.from({ length: TOTAL_STARS }).map((_, idx) => (
        <Star
          key={idx}
          aria-hidden
          className={
            idx < filled
              ? "h-4 w-4 fill-(--color-stamp-gold) text-(--color-stamp-gold)"
              : "h-4 w-4 text-(--color-stamp-divider)"
          }
        />
      ))}
    </div>
  );
}
