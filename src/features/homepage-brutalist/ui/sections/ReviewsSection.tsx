"use client";

import { Star, ThumbsUp } from "lucide-react";
import { BrutalistSectionHeader } from "../components/BrutalistSectionHeader";
import {
  brutalistRatingSummary,
  brutalistTestimonials,
} from "@/features/homepage-brutalist/lib/constants/brutalistContent";

/**
 * Reviews Section Component
 *
 * Features:
 * - Dark background (bg-ink)
 * - Grid split 4/8
 * - Left: Rating summary card (4.8 rating + platform breakdown)
 * - Right: 2×2 testimonial grid with gradient borders
 */

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="relative py-32 px-8 bg-ink text-white overflow-hidden"
    >
      {/* Decorative blur blob */}
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-brandOrange/5 blur-[150px] rounded-full" />

      <BrutalistSectionHeader
        className="relative z-10"
        title="Social Proof"
        label="VERIFIED_REVIEWS"
        inverted
      />

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left: Rating Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white/5 border border-white/10 p-10 h-full flex flex-col justify-between shadow-[8px_8px_0px_rgba(255,255,255,0.05)]">
            {/* Overall rating */}
            <div className="mb-12">
              <div className="font-anton text-8xl mb-4">
                {brutalistRatingSummary.overall}
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(brutalistRatingSummary.overall)
                        ? "fill-brandPurple text-brandPurple"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs uppercase tracking-widest opacity-60 font-space font-bold">
                {brutalistRatingSummary.totalReviews.toLocaleString()} Verified
                Reviews
              </p>
            </div>

            {/* Platform breakdown */}
            <div className="space-y-6">
              <div className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 font-space mb-4">
                Platform Breakdown
              </div>
              {brutalistRatingSummary.platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0"
                >
                  <span className="text-sm uppercase tracking-wide font-space">
                    {platform.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold">
                      {platform.rating}
                    </span>
                    <span className="text-xs opacity-50">
                      ({platform.reviews})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Testimonials Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {brutalistTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              id={testimonial.id}
              className="cta-gradient-border group min-h-80 w-full flex"
            >
              <div className="bg-ink p-8 lg:p-10 flex flex-col justify-between w-full">
                {/* Header: Stars + Platform */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-brandCyan text-brandCyan"
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-40 font-space">
                      {testimonial.platform}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-sm leading-relaxed mb-6 font-space">
                    "{testimonial.text}"
                  </p>
                </div>

                {/* Footer: Author + Helpful count */}
                <div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="font-anton text-lg uppercase tracking-tight mb-1">
                        {testimonial.author}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-60 font-space font-bold">
                        {testimonial.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{testimonial.helpful}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
