/**
 * HomeReviewsSection
 *
 * "Social Proof" — overall rating card with platform breakdown next to a
 * 2×2 grid of testimonial cards with platform-specific colors and icons.
 */

import { useTranslations } from "next-intl";
import { HOME_TESTIMONIALS } from "../../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { ReviewsRatingSummary } from "./ReviewsRatingSummary";
import { ReviewsTestimonialCard } from "./ReviewsTestimonialCard";

export function HomeReviewsSection() {
  const t = useTranslations("home.reviews");

  return (
    <section
      id="reviews"
      aria-labelledby="home-reviews-title"
      className="px-4 pt-20 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          id="home-reviews-title"
          label={t("label")}
          title={t("title")}
          accent={t("accent")}
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
          <ReviewsRatingSummary />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:col-span-8">
            {HOME_TESTIMONIALS.map((testimonial) => (
              <ReviewsTestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
