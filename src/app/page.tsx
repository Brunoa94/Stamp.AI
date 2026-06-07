"use client";

import { useTshirtProducts } from "@/queries/productQueries";
import { BottomSectionNav } from "@/features/homepage/ui/BottomSectionNav";
import {
  NAVBAR_HEIGHT,
  processSteps,
  SCROLL_COOLDOWN,
  SCROLL_DURATION,
  SECTION_IDS,
  SECTION_LABELS,
} from "@/features/homepage/lib/constants/homepageContent";
import { useHomepageSectionScroll } from "@/features/homepage/lib/hooks/useHomepageSectionScroll";
import { ScrollProgressIndicator } from "@/features/homepage/ui/navigation/ScrollProgressIndicator";
import { SectionDotsNav } from "@/features/homepage/ui/navigation/SectionDotsNav";
import { BrandStorySection } from "@/features/homepage/ui/sections/BrandStorySection";
import { CtaHomeSection } from "@/features/homepage/ui/sections/CtaHomeSection";
import { FaqSection } from "@/features/homepage/ui/sections/FaqSection";
import { HeroSection } from "@/features/homepage/ui/sections/HeroSection";
import { ProcessSection } from "@/features/homepage/ui/sections/ProcessSection";
import { ProductsSection } from "@/features/homepage/ui/sections/ProductsSection";
import { ReviewsSection } from "@/features/homepage/ui/sections/ReviewsSection";
import { SecuritySection } from "@/features/homepage/ui/sections/SecuritySection";
import { PromoCodesCarouselSection } from "@/features/homepage/ui/sections/PromoCodesCarouselSection/PromoCodesCarouselSection";

export default function Home() {
  const processSectionIndex = SECTION_IDS.indexOf("process");
  const { data: tshirtProducts = [], isLoading: isProductsLoading } =
    useTshirtProducts();
  const {
    activeProcessStep,
    currentSectionIndex,
    heroScale,
    isAtFooter,
    scrollProgress,
    scrollToFooter,
    scrollToSection,
  } = useHomepageSectionScroll({
    sectionIds: SECTION_IDS,
    navbarHeight: NAVBAR_HEIGHT,
    scrollCooldown: SCROLL_COOLDOWN,
    scrollDuration: SCROLL_DURATION,
    processSectionId: "process",
    processStepsCount: processSteps.length,
  });

  return (
    <div className="homepage-scroll-snap relative -mt-20 min-h-screen w-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_1px_1px,#1e293b_1px,transparent_0)]/6 bg-size-[6px_6px]" />

      <SectionDotsNav
        sectionIds={SECTION_IDS}
        currentSectionIndex={currentSectionIndex}
        onScrollToSection={scrollToSection}
      />

      <BottomSectionNav
        sectionIds={SECTION_IDS}
        sectionLabels={SECTION_LABELS}
        currentSectionIndex={currentSectionIndex}
        isAtFooter={isAtFooter}
        isHidden={currentSectionIndex === processSectionIndex}
        onScrollToSection={scrollToSection}
        onScrollToFooter={scrollToFooter}
      />

      <ScrollProgressIndicator
        scrollProgress={scrollProgress}
        currentSectionIndex={currentSectionIndex}
      />

      <HeroSection heroScale={heroScale} />
      <CtaHomeSection />
      <ProcessSection activeProcessStep={activeProcessStep} />
      <BrandStorySection />
      <PromoCodesCarouselSection />
      <ProductsSection
        isProductsLoading={isProductsLoading}
        tshirtProducts={tshirtProducts}
      />
      <FaqSection />
      <SecuritySection />
      <ReviewsSection />
    </div>
  );
}
