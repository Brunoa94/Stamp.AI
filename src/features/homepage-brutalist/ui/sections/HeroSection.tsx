"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/features/ui/button";
import { TrustIndicators } from "../components/TrustIndicators";

/**
 * Hero Section Component
 *
 * Features:
 * - Massive "STAMP.AI" title with layered text shadows
 * - 3 animated conic gradient overlays (different speeds)
 * - Floating blur blobs (purple, cyan, orange)
 * - Product image with grayscale hover effect (desktop only)
 * - "Scroll to Build" CTA
 */

export function HeroSection() {
  const trustItems = [
    {
      label: "AI-Powered",
      dotClassName: "bg-brandPurple",
    },
    {
      label: "Archival Quality",
      dotClassName: "bg-brandCyan [animation-delay:0.5s]",
    },
    {
      label: "Instant Delivery",
      dotClassName: "bg-brandOrange [animation-delay:1s]",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-concrete text-ink overflow-hidden pt-32 pb-20 px-8">
      {/* Animated gradient overlays - 3 layers at different speeds */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-linear-to-br from-brandPurple via-brandCyan to-brandOrange rounded-full blur-[120px] animate-[gradientRotate_8s_linear_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-[50vw] h-[50vw] bg-linear-to-tl from-brandCyan via-brandOrange to-brandPurple rounded-full blur-[100px] animate-[gradientRotate_12s_linear_infinite_reverse]" />
        <div className="absolute bottom-1/4 left-1/3 w-[55vw] h-[55vw] bg-linear-to-tr from-brandOrange via-brandPurple to-brandCyan rounded-full blur-[110px] animate-[gradientRotate_10s_linear_infinite]" />
      </div>

      {/* Floating blur blobs - purple, cyan, orange */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-brandPurple/20 blur-[80px] rounded-full animate-[float_40s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 right-20 w-80 h-80 bg-brandCyan/15 blur-[100px] rounded-full animate-[float_50s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-brandOrange/20 blur-[90px] rounded-full animate-[floatReverse_45s_ease-in-out_infinite]" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-screen-2xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Hero text */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Massive title with layered shadow */}
          <h1 className="font-anton text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase layered-shadow mb-8">
            STAMP
            <span className="text-brandPurple">.</span>AI
          </h1>

          {/* Subtitle */}
          <p className="font-space text-sm md:text-base lg:text-lg font-light tracking-wide uppercase max-w-2xl mb-12 opacity-70 leading-relaxed">
            AI-powered design synthesis for premium apparel. Create
            archive-quality graphics in seconds. Engineered for the creative
            elite who demand precision.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Button
              asChild
              variant="default"
              className="cta-gradient-border h-auto rounded-none bg-ink px-10 py-4 font-anton text-xl tracking-widest uppercase hover:scale-105 transition-all duration-300 shadow-[8px_8px_0px_rgba(10,10,10,0.15)] text-white text-center"
            >
              <Link href="/create">Start Creating</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto rounded-none border-2 border-ink bg-transparent px-10 py-4 font-anton text-xl tracking-widest uppercase hover:bg-ink hover:text-concrete transition-all duration-300 shadow-[8px_8px_0px_rgba(10,10,10,0.05)] text-ink text-center"
            >
              <Link href="#products">View Catalog</Link>
            </Button>
          </div>

          <TrustIndicators items={trustItems} className="mt-16 opacity-50" />
        </div>

        {/* Right: Product image (desktop only) */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="relative aspect-3/4 w-full max-w-md mx-auto">
            {/* Decorative border frame */}
            <div className="absolute inset-0 border-2 border-ink translate-x-4 translate-y-4 opacity-20" />

            {/* Product image container */}
            <div className="relative w-full h-full bg-white border-2 border-ink overflow-hidden shadow-[12px_12px_0px_rgba(10,10,10,0.1)]">
              <img
                src="/images/hero-product.jpg"
                alt="Premium Custom Apparel"
                className="w-full h-full object-cover grayscale-hover"
              />

              {/* Product label overlay */}
              <div className="absolute bottom-6 left-6 bg-concrete px-4 py-2 border-2 border-ink shadow-[4px_4px_0px_rgba(10,10,10,0.3)]">
                <span className="text-[9px] font-bold tracking-[0.4em] uppercase font-space">
                  ESSENTIAL_WHT / 320GSM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group">
        <span className="text-[9px] font-bold tracking-[0.4em] uppercase font-space">
          Scroll to Build
        </span>
        <ArrowDown className="w-6 h-6 animate-bounce group-hover:text-brandPurple transition-colors" />
      </div>
    </section>
  );
}
