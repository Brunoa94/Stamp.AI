"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { TrustIndicators } from "../components/TrustIndicators";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

/**
 * CTA Section Component
 *
 * Features:
 * - Dark background with gradient overlay
 * - Centered content: Massive heading + subtitle
 * - Two CTAs: Gradient button + border button
 * - Floating blur blobs for depth
 */

export function CtaSection() {
  const trustItems = [
    {
      label: "5-7 Day Delivery",
      dotClassName: "bg-brandPurple",
    },
    {
      label: "30-Day Guarantee",
      dotClassName: "bg-brandCyan [animation-delay:0.5s]",
    },
    {
      label: "Carbon Neutral",
      dotClassName: "bg-brandOrange [animation-delay:1s]",
    },
  ];

  return (
    <section className="relative py-40 px-8 bg-ink text-white overflow-hidden">
      {/* Gradient overlay background */}
      <div className="absolute inset-0 bg-linear-to-br from-brandPurple/10 via-transparent to-brandCyan/10" />

      {/* Floating blur blobs */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-brandPurple/20 blur-[120px] rounded-full animate-[float_35s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brandCyan/15 blur-[140px] rounded-full animate-[floatReverse_40s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brandOrange/10 blur-[160px] rounded-full animate-[pulseSlow_8s_ease-in-out_infinite]" />

      {/* Content */}
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Massive heading */}
        <Heading as="h2" variant="cta" className="mb-8 layered-shadow">
          Ready to
          <br />
          Stamp Your
          <br />
          Vision?
        </Heading>

        {/* Subtitle */}
        <Paragraph
          className="max-w-2xl mx-auto mb-16 opacity-80"
        >
          Join thousands of creators using AI-powered design synthesis to bring
          their ideas to life. Start creating archival-quality apparel in
          seconds.
        </Paragraph>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            asChild
            variant="default"
            className="cta-gradient-border h-auto rounded-none bg-ink px-12 py-5 font-anton text-xl md:text-2xl tracking-widest uppercase hover:scale-105 transition-all duration-300 shadow-[8px_8px_0px_rgba(255,255,255,0.1)] text-white flex items-center gap-3 group"
          >
            <Link href="/stamp">
              <Span>Start Creating</Span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-none border-2 border-white bg-transparent px-12 py-5 font-anton text-xl md:text-2xl tracking-widest uppercase hover:bg-white hover:text-ink transition-all duration-300 shadow-[8px_8px_0px_rgba(255,255,255,0.05)] text-white"
          >
            <Link href="/products">Browse Catalog</Link>
          </Button>
        </div>

        <TrustIndicators
          items={trustItems}
          className="mt-20 justify-center gap-12 opacity-40"
        />
      </div>
    </section>
  );
}
