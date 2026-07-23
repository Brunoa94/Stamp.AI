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
import {
  HOME_PLATFORM_CONFIG,
  type HomeTestimonialType,
} from "../../../lib/constants/homepageContent";
import { HomeRatingStars } from "../HomeRatingStars";
import { ReviewsPlatformBadge } from "./ReviewsPlatformBadge";

interface ReviewsTestimonialCardProps {
  testimonial: HomeTestimonialType;
}

export function ReviewsTestimonialCard({
  testimonial,
}: ReviewsTestimonialCardProps) {
  const t = useTranslations("home.reviews");
  const config = HOME_PLATFORM_CONFIG[testimonial.platform];

  return (
    <article
      className="flex flex-col border bg-(--color-stamp-white) p-5 sm:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-(--shadow-stamp-card-hover)"
      style={{
        borderColor: config?.borderColor ?? "var(--color-stamp-divider)",
      }}
    >
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

      <div
        className="mt-8 flex items-end justify-between border-t pt-6"
        style={{
          borderColor: config?.borderColor ?? "var(--color-stamp-divider)",
        }}
      >
        <div>
          <Heading as="h3" variant="item">
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
