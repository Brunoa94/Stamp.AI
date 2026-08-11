/**
 * HomeReviewsSection
 *
 * "Social Proof" — overall rating card with platform breakdown next to a
 * 2×2 grid of testimonial cards with platform-specific colors and icons.
 */

import { useTranslations } from "next-intl";
import { HOME_TESTIMONIALS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";
import { ReviewsRatingSummary } from "../components/ReviewsSection/ReviewsRatingSummary";
import { ReviewsTestimonialCard } from "../components/ReviewsSection/ReviewsTestimonialCard";

export function HomeReviewsSection() {
  const t = useTranslations("home.reviews");

  return (
    <section
      id="reviews"
      className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24"
    >
      <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
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
      </SectionReveal>
    </section>
  );
}
