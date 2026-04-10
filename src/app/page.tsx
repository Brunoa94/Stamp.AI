"use client";

import { useTshirtProducts } from "@/queries/productQueries";
import { BottomSectionNav } from "@/features/homepage/BottomSectionNav";
import {
  NAVBAR_HEIGHT,
  processSteps,
  SCROLL_COOLDOWN,
  SCROLL_DURATION,
  SECTION_IDS,
  SECTION_LABELS,
} from "@/features/homepage/constants/homepageContent";
import { useHomepageSectionScroll } from "@/features/homepage/hooks/useHomepageSectionScroll";
import { ScrollProgressIndicator } from "@/features/homepage/navigation/ScrollProgressIndicator";
import { SectionDotsNav } from "@/features/homepage/navigation/SectionDotsNav";
import { CtaHomeSection } from "@/features/homepage/sections/CtaHomeSection";
import { FaqSection } from "@/features/homepage/sections/FaqSection";
import { HeroSection } from "@/features/homepage/sections/HeroSection";
import { ProcessSection } from "@/features/homepage/sections/ProcessSection";
import { ProductsSection } from "@/features/homepage/sections/ProductsSection";
import { ReviewsSection } from "@/features/homepage/sections/ReviewsSection";
import { SecuritySection } from "@/features/homepage/sections/SecuritySection";
import { PromoCodesCarouselSection } from "@/features/homepage/sections/PromoCodesCarouselSection";
import { TestimonialsSection } from "@/features/homepage/sections/TestimonialsSection";
import { useSmoothScroll } from "@/features/homepage/hooks/useSmoothScroll";

export default function Home() {
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
    enableScrollSnap: false,
  });

  // Enable smooth scroll effect
  useSmoothScroll({
    smoothness: 0.08, // Adjust between 0.05 (very smooth/slow) and 0.2 (faster)
    enabled: true,
  });

  return (
    <div className="relative -mt-20 min-h-screen w-screen bg-white text-slate-900">
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
      <TestimonialsSection />
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
