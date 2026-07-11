/**
 * HomeHeroSection
 *
 * Luxury hero with animated blur blobs, gradient logo text,
 * and framed product image on light background.
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
    <section className="relative overflow-hidden bg-(--color-stamp-off-white) px-6 pb-24 pt-30 lg:px-12 xl:px-24">
      {/* Animated blur blobs - subtle on light background */}
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-purple absolute -left-40 -top-40 opacity-20"
      />
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-cyan absolute right-[-5%] top-1/2 opacity-15"
      />
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-orange absolute bottom-0 left-1/3 opacity-15"
      />

      <div className="relative z-10 mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Heading
            as="h1"
            variant="title"
            className="relative mb-10 text-7xl text-(--color-stamp-chocolate) md:text-8xl lg:text-9xl"
          >
            Stamp{" "}
            <Span
              variant="serif"
              className="text-7xl text-(--color-stamp-taupe) md:text-8xl lg:text-9xl"
            >
              ai
            </Span>
            {/* Subtle glow effect */}
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 bg-linear-to-r from-(--color-stamp-chocolate)/10 via-(--color-stamp-gold)/15 to-(--color-stamp-cream)/20 opacity-60 blur-3xl"
            />
          </Heading>

          <Paragraph
            variant="lead"
            className="mb-12 max-w-xl text-(--color-stamp-chocolate)/70"
          >
            AI-powered design synthesis for premium apparel. Create
            archive-quality graphics in seconds. Engineered for the creative
            elite who demand precision.
          </Paragraph>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="cta" className="group">
              <Link href="/stamp">
                Start Creating
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost-stamp"
              className="border border-(--color-stamp-divider) hover:border-(--color-stamp-gold)"
            >
              <Link href="#products">View Catalog</Link>
            </Button>
          </div>

          <HomeTrustIndicators items={HOME_HERO_TRUST} className="mt-16" />
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="group relative">
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 h-full w-full border border-(--color-stamp-gold) transition-all duration-500 group-hover:-bottom-6 group-hover:-right-6"
            />
            <div className="relative aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream) transition-transform duration-500 group-hover:scale-[1.02]">
              <Image
                src="/images/hero-product.jpg"
                alt="Premium custom apparel"
                fill
                priority
                sizes="(max-width: 1024px) 0px, 40vw"
                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
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

      <div className="relative z-10 mt-20 flex flex-col items-center gap-3">
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
