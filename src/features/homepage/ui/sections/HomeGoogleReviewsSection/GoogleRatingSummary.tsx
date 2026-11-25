/**
 * GoogleRatingSummary
 *
 * The overall Google rating, how many reviews it is based on, a link to
 * leave one, and how the reviews shown were chosen (EU consumer law asks
 * shops to say how they handle the reviews they display).
 */

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { GoogleReviewsSummaryT } from "../../../lib/types/googleReviews";
import { HomeRatingStars } from "../../components/HomeRatingStars";

interface PropsI {
  summary: GoogleReviewsSummaryT;
}

export function GoogleRatingSummary({ summary }: PropsI) {
  const t = useTranslations("home.googleReviews");
  const locale = useLocale();
  const rating = summary.rating.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <article className="flex flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) sm:p-10 lg:col-span-4 lg:self-start">
      <div className="flex items-center gap-2">
        <Image src="/assets/google-icon.svg" alt="" aria-hidden width={18} height={18} />
        <Span variant="label" className="text-(--color-stamp-taupe)">
          Google
        </Span>
      </div>

      <Span as="p" variant="metric" className="mt-6 text-(--color-stamp-chocolate)">
        {rating}
      </Span>
      <HomeRatingStars rating={summary.rating} className="mt-4" />
      <Paragraph variant="sm" className="mt-3 text-(--color-stamp-taupe)">
        {t("basedOn", { count: summary.totalReviews })}
      </Paragraph>

      <Button asChild variant="secondary-compact" className="mt-8 self-start">
        <a href={summary.writeReviewUrl} target="_blank" rel="noopener noreferrer">
          {t("writeReview")}
          <Span unstyled className="sr-only">
            {" "}
            {t("opensInNewTab")}
          </Span>
        </a>
      </Button>

      <Paragraph
        variant="xs"
        className="mt-8 border-t border-(--color-stamp-divider) pt-6 text-(--color-stamp-taupe)"
      >
        {t("disclosure")}
      </Paragraph>
    </article>
  );
}
