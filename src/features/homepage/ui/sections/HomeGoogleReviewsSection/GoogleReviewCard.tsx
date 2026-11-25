/**
 * GoogleReviewCard
 *
 * One Google review: stars, the review text, and the author attribution
 * Google's terms require (name, linked profile, photo when there is one).
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { GoogleReviewT } from "../../../lib/types/googleReviews";
import { HomeRatingStars } from "../../components/HomeRatingStars";
import { GoogleReviewAuthorLink } from "./GoogleReviewAuthorLink";
import { GoogleReviewInitial } from "./GoogleReviewInitial";

interface PropsI {
  review: GoogleReviewT;
}

export function GoogleReviewCard({ review }: PropsI) {
  const t = useTranslations("home.googleReviews");
  const authorName = review.authorName ?? t("anonymousReviewer");

  return (
    <article className="flex w-full flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-5 shadow-(--shadow-stamp-card) sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <HomeRatingStars rating={review.rating} />
        <Image
          src="/assets/google-icon.svg"
          alt={t("postedOnGoogle")}
          width={16}
          height={16}
        />
      </div>

      <Paragraph
        variant="quote"
        className="line-clamp-6 flex-1 text-(--color-stamp-chocolate)"
      >
        &ldquo;{review.text}&rdquo;
      </Paragraph>

      <div className="mt-8 flex items-center gap-3 border-t border-(--color-stamp-divider) pt-6">
        {review.authorPhotoUrl ? (
          <Image
            src={review.authorPhotoUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full"
          />
        ) : (
          <GoogleReviewInitial name={authorName} />
        )}
        <div className="min-w-0">
          {review.authorUrl ? (
            <GoogleReviewAuthorLink name={authorName} href={review.authorUrl} />
          ) : (
            <Span as="p" className="truncate text-(--color-stamp-chocolate)">
              {authorName}
            </Span>
          )}
          {review.relativeTime && (
            <Span as="p" variant="micro" className="mt-1 text-(--color-stamp-taupe)">
              {review.relativeTime}
            </Span>
          )}
        </div>
      </div>
    </article>
  );
}
