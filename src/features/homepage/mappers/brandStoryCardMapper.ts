import { Heart, ShieldCheck, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BrandStoryCardTheme {
  gradient: string;
  border: string;
  bar: string;
  iconColor: string;
}

interface BrandStoryCardVisual {
  theme: BrandStoryCardTheme;
  icon: LucideIcon;
}

const BRAND_STORY_CARD_THEMES: BrandStoryCardTheme[] = [
  {
    gradient: "from-[#D946EF]/28 via-white/95 to-[#7C3AED]/20",
    border: "border-[#D946EF]/45",
    bar: "from-[#D946EF] to-[#7C3AED]",
    iconColor: "text-[#D946EF]",
  },
  {
    gradient: "from-[#7C3AED]/28 via-white/95 to-[#4F46E5]/20",
    border: "border-[#7C3AED]/45",
    bar: "from-[#7C3AED] to-[#4F46E5]",
    iconColor: "text-[#7C3AED]",
  },
  {
    gradient: "from-[#06B6D4]/28 via-white/95 to-[#4F46E5]/20",
    border: "border-[#06B6D4]/45",
    bar: "from-[#06B6D4] to-[#7C3AED]",
    iconColor: "text-[#06B6D4]",
  },
  {
    gradient: "from-[#FF8C42]/28 via-white/95 to-[#D946EF]/20",
    border: "border-[#FF8C42]/45",
    bar: "from-[#FF8C42] to-[#D946EF]",
    iconColor: "text-[#FF8C42]",
  },
];

const BRAND_STORY_CARD_ICONS: LucideIcon[] = [Heart, Target, ShieldCheck, Sparkles];

export function mapTrustHighlightIndexToCardVisual(index: number): BrandStoryCardVisual {
  const safeIndex = ((index % BRAND_STORY_CARD_THEMES.length) + BRAND_STORY_CARD_THEMES.length) %
    BRAND_STORY_CARD_THEMES.length;

  return {
    theme: BRAND_STORY_CARD_THEMES[safeIndex],
    icon: BRAND_STORY_CARD_ICONS[safeIndex],
  };
}
