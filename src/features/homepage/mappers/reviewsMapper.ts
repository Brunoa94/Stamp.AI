type ReviewSource = "Google" | "Trustpilot";

type ReviewIconKey = "google" | "trustpilot";

interface ReviewSourceVisual {
  icon: ReviewIconKey;
  cardClass: string;
  topBarClass: string;
  starClass: string;
  sourcePillClass: string;
  footerBorderClass: string;
  badgeCheckClass: string;
  summaryCardClass: string;
  summaryStarClass: string;
}

interface ReviewSummaryCard {
  source: ReviewSource;
  href: string;
  rating: string;
  label: string;
}

const REVIEW_SOURCE_VISUALS: Record<ReviewSource, ReviewSourceVisual> = {
  Google: {
    icon: "google",
    cardClass:
      "border-[#4285F4]/45 bg-linear-to-br from-[#4285F4]/10 via-white to-[#EA4335]/10",
    topBarClass: "bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05]",
    starClass: "fill-[#FBBC05] text-[#FBBC05]",
    sourcePillClass:
      "border-[#4285F4]/30 bg-[#4285F4]/10 text-[#4285F4] hover:bg-[#4285F4]/20",
    footerBorderClass: "border-[#4285F4]/20",
    badgeCheckClass: "text-[#4285F4]",
    summaryCardClass:
      "border-[#4285F4]/30 bg-linear-to-r from-[#4285F4]/10 via-white/90 to-[#EA4335]/8 hover:border-[#4285F4]/50",
    summaryStarClass: "fill-[#FBBC04] text-[#FBBC04]",
  },
  Trustpilot: {
    icon: "trustpilot",
    cardClass:
      "border-[#00B67A]/45 bg-linear-to-br from-[#00B67A]/12 via-white to-[#00B67A]/5",
    topBarClass: "bg-[#00B67A]",
    starClass: "fill-[#00B67A] text-[#00B67A]",
    sourcePillClass:
      "border-[#00B67A]/30 bg-[#00B67A]/10 text-[#00B67A] hover:bg-[#00B67A]/20",
    footerBorderClass: "border-[#00B67A]/20",
    badgeCheckClass: "text-[#00B67A]",
    summaryCardClass:
      "border-[#00B67A]/30 bg-linear-to-r from-[#00B67A]/10 via-white/90 to-[#00B67A]/5 hover:border-[#00B67A]/50",
    summaryStarClass: "fill-[#00B67A] text-[#00B67A]",
  },
};

export const REVIEW_SUMMARY_CARDS: ReviewSummaryCard[] = [
  {
    source: "Google",
    href: "https://www.google.com/search?q=stamp.ai+reviews",
    rating: "4.9",
    label: "Google · 1,842 reviews",
  },
  {
    source: "Trustpilot",
    href: "https://www.trustpilot.com/",
    rating: "4.8",
    label: "Trustpilot · 1,005 reviews",
  },
];

export function mapReviewSourceToVisual(source: string): ReviewSourceVisual {
  return source === "Google"
    ? REVIEW_SOURCE_VISUALS.Google
    : REVIEW_SOURCE_VISUALS.Trustpilot;
}
