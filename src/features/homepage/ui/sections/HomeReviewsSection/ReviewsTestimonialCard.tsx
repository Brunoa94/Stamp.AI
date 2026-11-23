/**
 * ReviewsTestimonialCard
 *
 * Individual testimonial card with platform-specific styling.
 */

import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { HomeTestimonialType } from "../../../lib/constants/homepageContent";
import { HomeRatingStars } from "./HomeRatingStars";
import { ReviewsPlatformBadge } from "./ReviewsPlatformBadge";

interface ReviewsTestimonialCardProps {
  testimonial: HomeTestimonialType;
}

export function ReviewsTestimonialCard({
  testimonial,
}: ReviewsTestimonialCardProps) {
  const t = useTranslations("home.reviews");

  return (
    <article className="flex flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-5 shadow-(--shadow-stamp-card) sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <HomeRatingStars rating={testimonial.rating} />
        <ReviewsPlatformBadge platform={testimonial.platform} />
      </div>

      <Paragraph
        variant="quote"
        className="flex-1 text-(--color-stamp-chocolate)"
      >
        &ldquo;{t(`testimonials.${testimonial.id}.quote`)}&rdquo;
      </Paragraph>

      <div className="mt-8 flex items-end justify-between border-t border-(--color-stamp-divider) pt-6">
        <div>
          <Heading as="h3" variant="item" className="text-(--color-stamp-chocolate)">
            {t(`testimonials.${testimonial.id}.author`)}
          </Heading>
          <Span as="p" variant="micro" className="mt-1 text-(--color-stamp-taupe)">
            {t(`testimonials.${testimonial.id}.role`)}
          </Span>
        </div>
        <Span
          variant="micro"
          className="flex items-center gap-2 text-(--color-stamp-taupe)"
        >
          <ThumbsUp aria-hidden className="h-3.5 w-3.5" />
          {testimonial.helpful}
        </Span>
      </div>
    </article>
  );
}
