/**
 * HomeHeroSection
 *
 * Luxury hero: display title with serif accent, lead copy, primary/outline
 * CTAs, trust indicators and a framed product image.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_HERO_TRUST } from "../../lib/constants/homepageContent";
import { HomeTrustIndicators } from "../components/HomeTrustIndicators";

export function HomeHeroSection() {
  return (
    <section className="relative bg-(--color-stamp-off-white) px-6 pb-24 pt-16 lg:px-12 xl:px-24">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Span variant="sm" className="mb-8 block text-(--color-stamp-taupe)">
            Design Synthesis Atelier
          </Span>

          <Heading
            as="h1"
            variant="display"
            className="mb-10 text-(--color-stamp-chocolate)"
          >
            Stamp{" "}
            <Span variant="serif" className="text-(--color-stamp-taupe)">
              ai
            </Span>
          </Heading>

          <Paragraph
            variant="lead"
            className="mb-12 max-w-xl text-(--color-stamp-taupe)"
          >
            AI-powered design synthesis for premium apparel. Create
            archive-quality graphics in seconds. Engineered for the creative
            elite who demand precision.
          </Paragraph>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="secondary-brown" className="group">
              <Link href="/stamp">
                Start Creating
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline-brown">
              <Link href="#products">View Catalog</Link>
            </Button>
          </div>

          <HomeTrustIndicators items={HOME_HERO_TRUST} className="mt-16" />
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 h-full w-full border border-(--color-stamp-gold)"
            />
            <div className="relative aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
              <Image
                src="/images/hero-product.jpg"
                alt="Premium custom apparel"
                fill
                priority
                sizes="(max-width: 1024px) 0px, 40vw"
                className="object-cover grayscale transition-all duration-700 hover:grayscale-0"
              />
              <Span
                variant="micro"
                className="absolute bottom-6 left-6 bg-(--color-stamp-off-white)/90 px-4 py-2 text-(--color-stamp-chocolate) backdrop-blur-sm"
              >
                Essential_Wht / 320GSM
              </Span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-3">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          Scroll to Build
        </Span>
        <ArrowDown
          aria-hidden
          className="h-4 w-4 animate-bounce text-(--color-stamp-gold)"
        />
      </div>
    </section>
  );
}
