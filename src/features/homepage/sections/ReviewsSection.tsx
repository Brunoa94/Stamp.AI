import { BadgeCheck, Star } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { reviews } from "@/features/homepage/constants/homepageContent";
import { SectionHeader } from "@/features/homepage/components/SectionHeader";
import {
  mapReviewSourceToVisual,
  REVIEW_SUMMARY_CARDS,
} from "@/features/homepage/mappers/reviewsMapper";

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden border-t border-slate-200 bg-linear-to-br from-[#7C3AED]/8 via-white to-[#06B6D4]/10 py-24"
    >
      <div
        className="pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full bg-[#7C3AED]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-[#06B6D4]/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6 md:px-16 xl:px-24">
        <header>
          <SectionHeader
            eyebrow="06 / Reviews"
            title="Trusted by creators"
            description="Verified ratings and feedback from real Stamp.AI customers."
            titleSize="xl"
            descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
          />

          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {REVIEW_SUMMARY_CARDS.map((summary) => {
              const visual = mapReviewSourceToVisual(summary.source);

              return (
                <a
                  key={summary.source}
                  href={summary.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`glass-card group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${visual.summaryCardClass}`}
                >
                  {visual.icon === "google" ? (
                    <FaGoogle className="h-6 w-6 shrink-0 text-[#4285F4]" />
                  ) : (
                    <SiTrustpilot className="h-6 w-6 shrink-0 text-[#00B67A]" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${visual.summaryStarClass}`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-bold text-slate-900">
                        {summary.rating}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {summary.label}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.slice(0, 3).map((review) => {
            const visual = mapReviewSourceToVisual(review.source);

            return (
              <article
                key={`${review.name}-${review.source}`}
                className={`glass-card relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${visual.cardClass}`}
              >
                <div
                  className={`absolute left-0 right-0 top-0 h-1 ${visual.topBarClass}`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {review.name}
                    </h3>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${visual.starClass}`}
                        />
                      ))}
                    </div>
                    <a
                      href={review.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${visual.sourcePillClass}`}
                    >
                      {visual.icon === "google" ? (
                        <FaGoogle className="h-2.5 w-2.5" />
                      ) : (
                        <SiTrustpilot className="h-2.5 w-2.5" />
                      )}
                      <span>{review.source}</span>
                    </a>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {review.date}
                  </span>
                </div>

                <p className="font-accent text-sm italic leading-relaxed text-slate-700">
                  {review.quote}
                </p>

                <div
                  className={`mt-auto flex items-center gap-2 border-t pt-4 ${visual.footerBorderClass}`}
                >
                  <BadgeCheck className={`h-4 w-4 ${visual.badgeCheckClass}`} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {review.helpful}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
