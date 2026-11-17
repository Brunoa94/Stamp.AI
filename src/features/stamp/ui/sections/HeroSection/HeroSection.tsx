"use client";

import { memo } from "react";
import { HeroContent } from "./HeroContent";
import { StampScan } from "../../components/StampScan/StampScan";

/**
 * HeroSection
 *
 * Entry point for the Stamp luxury flow: the brand introduction and primary
 * CTA beside the animated product scan. Below lg the scan is a strip above the
 * copy; from lg the left column stays empty for StampEntryPanel, which lives
 * under the sliding canvas so it can sweep into the backdrop on the way out.
 */

interface PropsI {
  onBegin: () => void;
}

function HeroSectionComponent({ onBegin }: PropsI) {
  return (
    <section
      id="hero"
      className="h-full overflow-y-auto grid grid-cols-1 content-start lg:grid-cols-2 lg:content-stretch"
    >
      <div className="relative h-80 lg:hidden">
        <StampScan />
      </div>
      <div aria-hidden="true" className="hidden lg:block" />
      <HeroContent onBegin={onBegin} />
    </section>
  );
}

export const HeroSection = memo(HeroSectionComponent);
