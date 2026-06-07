import { HeroSection } from "@/features/homepage-brutalist/ui/sections/HeroSection";
import { ProductsSection } from "@/features/homepage-brutalist/ui/sections/ProductsSection";
import { ProcessSection } from "@/features/homepage-brutalist/ui/sections/ProcessSection";
import { AboutSection } from "@/features/homepage-brutalist/ui/sections/AboutSection";
import { CtaSection } from "@/features/homepage-brutalist/ui/sections/CtaSection";
import { ReviewsSection } from "@/features/homepage-brutalist/ui/sections/ReviewsSection";
import { FaqSection } from "@/features/homepage-brutalist/ui/sections/FaqSection";

/**
 * Brutalist Homepage
 *
 * Orchestrates all brutalist homepage sections following the Superdesign draft
 * Design: "STAMP.AI | Refined Cart Interface"
 *
 * Note: Navbar, Footer, and GrainOverlay are in the root layout
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-concrete text-ink font-space">
      <HeroSection />
      <ProductsSection />
      <ProcessSection />
      <AboutSection />
      <CtaSection />
      <ReviewsSection />
      <FaqSection />
    </div>
  );
}
