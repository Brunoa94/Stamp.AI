/**
 * HomeReviewsSection
 *
 * "Social Proof" — overall rating card with platform breakdown next to a
 * 2×2 grid of testimonial cards.
 */

import { ThumbsUp } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import {
  HOME_RATING_SUMMARY,
  HOME_TESTIMONIALS,
} from "../../lib/constants/homepageContent";
import { HomeRatingStars } from "../components/HomeRatingStars";
import { HomeSectionHeader } from "../components/HomeSectionHeader";

export function HomeReviewsSection() {
  return (
    <section
      id="reviews"
      className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24"
    >
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          title="Social"
          accent="proof"
          label="Verified Reviews"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <article className="border border-(--color-stamp-divider) bg-(--color-stamp-white) p-10 lg:col-span-4">
            <Span variant="metric" className="text-(--color-stamp-chocolate)">
              {HOME_RATING_SUMMARY.overall}
            </Span>
            <HomeRatingStars
              rating={HOME_RATING_SUMMARY.overall}
              className="mt-4"
            />
            <Span
              as="p"
              variant="micro"
              className="mt-3 text-(--color-stamp-taupe)"
            >
              {HOME_RATING_SUMMARY.totalReviews.toLocaleString()} Verified
              Reviews
            </Span>

            <div className="mt-10 space-y-4 border-t border-(--color-stamp-divider) pt-8">
              <Span
                as="p"
                variant="micro"
                className="text-(--color-stamp-taupe)"
              >
                Platform Breakdown
              </Span>
              {HOME_RATING_SUMMARY.platforms.map((entry) => (
                <div
                  key={entry.platform}
                  className="flex items-center justify-between"
                >
                  <Span variant="micro" className="text-(--color-stamp-chocolate)">
                    {entry.platform}
                  </Span>
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {entry.rating} · {entry.reviews}
                  </Span>
                </div>
              ))}
            </div>
          </article>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8">
            {HOME_TESTIMONIALS.map((testimonial) => (
              <article
                key={testimonial.author}
                className="flex flex-col border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover)"
              >
                <div className="mb-6 flex items-center justify-between">
                  <HomeRatingStars rating={testimonial.rating} />
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {testimonial.platform}
                  </Span>
                </div>

                <Paragraph
                  variant="quote"
                  className="flex-1 text-(--color-stamp-chocolate)"
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </Paragraph>

                <div className="mt-8 flex items-end justify-between border-t border-(--color-stamp-divider) pt-6">
                  <div>
                    <Heading as="h3" variant="item">
                      {testimonial.author}
                    </Heading>
                    <Span
                      as="p"
                      variant="micro"
                      className="mt-1 text-(--color-stamp-taupe)"
                    >
                      {testimonial.role}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
