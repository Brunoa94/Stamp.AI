/**
 * HomeGoogleReviewsSection
 *
 * Trust section with the business's real Google rating and the reviews
 * Google ranks as most relevant, fetched on the server (getGoogleReviews).
 * The homepage only renders it when Google returned something to show.
 */

import { useTranslations } from "next-intl";
import { Anchor } from "@/features/ui/anchor";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import type { GoogleReviewsSummaryT } from "../../../lib/types/googleReviews";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { GoogleRatingSummary } from "./GoogleRatingSummary";
import { GoogleReviewCard } from "./GoogleReviewCard";

interface PropsI {
  summary: GoogleReviewsSummaryT;
}

export function HomeGoogleReviewsSection({ summary }: PropsI) {
  const t = useTranslations("home.googleReviews");

  return (
    <section
      id="google-reviews"
      aria-labelledby="home-google-reviews-title"
      className="px-4 py-20 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          id="home-google-reviews-title"
          label={t("label")}
          title={t("title")}
          accent={t("accent")}
          className="mb-10"
          action={
            <Anchor
              href={summary.profileUrl}
              variant="subtle"
              className="shrink-0 text-sm text-(--color-stamp-chocolate)"
            >
              {t("seeAll")}
              <Span unstyled className="sr-only">
                {" "}
                {t("opensInNewTab")}
              </Span>
            </Anchor>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
          <GoogleRatingSummary summary={summary} />

          <List className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:col-span-8">
            {summary.reviews.map((review) => (
              <li key={review.id} className="flex">
                <GoogleReviewCard review={review} />
              </li>
            ))}
          </List>
        </div>
      </div>
    </section>
  );
}
