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
      className="relative bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24 overflow-hidden"
    >
      {/* Decorative gold accent lines */}
      <div className="absolute top-12 left-6 lg:left-12 xl:left-24 w-24 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />
      <div className="absolute top-12 right-6 lg:right-12 xl:right-24 w-24 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />

      {/* Decorative corner frames */}
      <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-t-2 border-l-2 border-(--color-stamp-gold)/20 rounded-tl-lg" aria-hidden="true" />
      <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-t-2 border-r-2 border-(--color-stamp-gold)/20 rounded-tr-lg" aria-hidden="true" />

      <SectionReveal className="relative mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
          className="mb-16"
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
